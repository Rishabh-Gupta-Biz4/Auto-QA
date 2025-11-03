/**
 * SIMPLIFIED AUTH CONTROLLER
 * 
 * This controller handles all authentication-related operations:
 * 1. User registration with OTP verification
 * 2. User login
 * 3. User profile retrieval
 * 
 * Each method is clearly documented with step-by-step explanations.
 */

import { Request, Response } from 'express';
import { Pool } from 'mysql2/promise';
import { 
  hashPassword,      // Function to hash passwords securely
  comparePassword,   // Function to compare passwords
  generateToken,     // Function to generate JWT tokens
  sanitizeUser       // Function to remove sensitive data from user object
} from '../../utils/auth';
import { otpService } from '../../services/otp.service';

export class AuthController {
  constructor(private db: Pool) {
    // Database connection is stored for use in all methods
  }

  /**
   * REGISTER USER WITH OTP VERIFICATION
   * 
   * This method handles the complete registration flow:
   * 1. Validates user data
   * 2. Checks if user already exists
   * 3. Generates OTP
   * 4. Stores user data temporarily
   * 5. Returns OTP for verification
   */
  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract user data from request body
      const { name, email, password, role = 'qa_engineer' } = req.body;

      // Step 1: Check if user already exists in database
      const [existingUsers] = await this.db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      // If user exists, return error
      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        res.status(409).json({
          success: false,
          message: 'User already exists'
        });
        return;
      }

      // Step 2: Generate OTP for email verification
      const otp = await otpService.generateRegistrationOTP(email);

      // Step 3: Return success response with OTP information
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully. Please verify your email to complete registration.',
        data: {
          email,
          expiresIn: otpService.getOTPExpiryMinutes(),
          maxAttempts: otpService.getMaxAttempts(),
          nextStep: 'Use /verify-otp-register endpoint with the OTP to complete registration'
        }
      });

    } catch (error: any) {
      // Handle specific errors
      if (error.message === 'User already exists') {
        res.status(409).json({
          success: false,
          message: 'User already exists'
        });
        return;
      }

      // Handle general errors
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  };

  /**
   * VERIFY OTP AND COMPLETE REGISTRATION
   * 
   * This method completes the registration process:
   * 1. Verifies the OTP
   * 2. Hashes the password
   * 3. Creates user account in database
   * 4. Generates authentication token
   * 5. Returns user data and token
   */
  public verifyOTPAndRegister = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract registration data from request body
      const { name, email, password, role = 'qa_engineer', otp } = req.body;

      // Step 1: Verify OTP
      const isOTPValid = await otpService.verifyRegistrationOTP(email, otp);
      if (!isOTPValid) {
        res.status(400).json({
          success: false,
          message: 'Invalid or expired OTP'
        });
        return;
      }

      // Step 2: Hash password for secure storage
      const hashedPassword = await hashPassword(password);

      // Step 3: Create user account in database
      const [result] = await this.db.execute(
        `INSERT INTO users (name, email, password, role, is_active, email_verified, created_at, updated_at) 
         VALUES (?, ?, ?, ?, true, true, NOW(), NOW())`,
        [name, email, hashedPassword, role]
      );

      // Get the new user's ID
      const insertResult = result as any;
      const userId = insertResult.insertId;

      // Step 4: Generate JWT token for authentication
      const token = generateToken({
        id: userId,
        email: email,
        role: role
      });

      // Step 5: Return success response with user data and token
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: { id: userId, name, email, role },
          token
        }
      });

    } catch (error) {
      // Handle any errors during registration
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  };

  /**
   * USER LOGIN
   * 
   * This method handles user login:
   * 1. Finds user by email
   * 2. Verifies password
   * 3. Generates authentication token
   * 4. Updates last login time
   * 5. Returns user data and token
   */
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Extract login credentials from request body
      const { email, password } = req.body;

      // Step 1: Find user by email in database
      const [users] = await this.db.execute(
        'SELECT * FROM users WHERE email = ? AND is_active = true',
        [email]
      );

      const userArray = users as any[];
      
      // If user not found, return error
      if (userArray.length === 0) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      const user = userArray[0];

      // Step 2: Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Step 3: Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role
      });

      // Step 4: Update last login time
      await this.db.execute(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );

      // Step 5: Return success response with user data and token
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: sanitizeUser(user), // Remove sensitive data like password
          token
        }
      });

    } catch (error) {
      // Handle any errors during login
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  };

  /**
   * GET USER PROFILE
   * 
   * This method returns the authenticated user's profile:
   * 1. Gets user ID from JWT token (set by auth middleware)
   * 2. Finds user in database
   * 3. Returns user profile data
   */
  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get user ID from JWT token (set by auth middleware)
      const userId = (req as any).user.userId;

      // Find user in database
      const [users] = await this.db.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      const userArray = users as any[];
      
      // If user not found, return error
      if (userArray.length === 0) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      // Return user profile (password is automatically removed by sanitizeUser)
      res.status(200).json({
        success: true,
        data: {
          user: sanitizeUser(userArray[0])
        }
      });

    } catch (error) {
      // Handle any errors
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  };

  /**
   * USER LOGOUT
   * 
   * This method handles user logout:
   * Since we use JWT tokens, logout is handled on the client side
   * by simply removing the token from storage
   */
  public logout = async (req: Request, res: Response): Promise<void> => {
    // JWT tokens are stateless, so logout is handled client-side
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  };
}