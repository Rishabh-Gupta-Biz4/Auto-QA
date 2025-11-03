/**
 * SIMPLIFIED OTP SERVICE
 * 
 * This service handles OTP (One-Time Password) generation and verification for user registration.
 * It stores OTPs in memory (not database) for simplicity and reliability.
 * 
 * Key Features:
 * - Generates 6-digit random OTPs
 * - Stores OTPs in memory with expiry time
 * - Limits verification attempts to prevent brute force
 * - Automatically cleans up expired OTPs
 */

import crypto from 'crypto';

// Interface defining the structure of OTP data stored in memory
interface OTPData {
  email: string;        // User's email address
  otp: string;          // 6-digit OTP code
  expiresAt: Date;      // When the OTP expires
  attempts: number;     // Number of failed verification attempts
}

export class OTPService {
  // In-memory storage for OTPs (email -> OTP data)
  private otpStorage: Map<string, OTPData> = new Map();
  
  // Configuration constants
  private readonly OTP_LENGTH = 6;           // OTP is always 6 digits
  private readonly OTP_EXPIRY_MINUTES = 10;  // OTP expires after 10 minutes
  private readonly MAX_ATTEMPTS = 3;         // Maximum 3 verification attempts

  constructor() {
    // Set up automatic cleanup of expired OTPs every 5 minutes
    setInterval(() => {
      this.cleanupExpiredOTPs();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
  }

  /**
   * Generate a random 6-digit OTP
   * @returns {string} 6-digit OTP (e.g., "123456")
   */
  private generateOTP(): string {
    // Generate random number between 100000 and 999999 (6 digits)
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate and store OTP for user registration
   * @param {string} email - User's email address
   * @returns {Promise<string>} The generated OTP
   */
  async generateRegistrationOTP(email: string): Promise<string> {
    // Remove any existing OTP for this email
    this.otpStorage.delete(email);

    // Generate new 6-digit OTP
    const otp = this.generateOTP();
    
    // Calculate expiry time (10 minutes from now)
    const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP in memory
    this.otpStorage.set(email, {
      email,
      otp,
      expiresAt,
      attempts: 0  // Start with 0 failed attempts
    });

    // Log OTP to console for development (remove in production)
    console.log(`\n🔐 OTP for ${email}: ${otp}`);
    console.log(`⏰ Expires in ${this.OTP_EXPIRY_MINUTES} minutes\n`);

    return otp;
  }

  /**
   * Verify OTP entered by user
   * @param {string} email - User's email address
   * @param {string} otp - OTP entered by user
   * @returns {Promise<boolean>} True if OTP is valid, false otherwise
   */
  async verifyRegistrationOTP(email: string, otp: string): Promise<boolean> {
    // Get OTP data from memory
    const otpData = this.otpStorage.get(email);

    // Check if OTP exists for this email
    if (!otpData) {
      console.log(`❌ No OTP found for ${email}`);
      return false;
    }

    // Check if OTP has expired
    if (otpData.expiresAt < new Date()) {
      console.log(`❌ OTP expired for ${email}`);
      this.otpStorage.delete(email); // Remove expired OTP
      return false;
    }

    // Check if too many failed attempts
    if (otpData.attempts >= this.MAX_ATTEMPTS) {
      console.log(`❌ Too many failed attempts for ${email}`);
      this.otpStorage.delete(email); // Remove OTP after max attempts
      return false;
    }

    // Check if OTP matches
    if (otpData.otp !== otp) {
      // Increment failed attempts
      otpData.attempts += 1;
      this.otpStorage.set(email, otpData);
      console.log(`❌ Invalid OTP for ${email}. Attempts: ${otpData.attempts}/${this.MAX_ATTEMPTS}`);
      return false;
    }

    // OTP is valid - remove it from storage
    this.otpStorage.delete(email);
    console.log(`✅ OTP verified successfully for ${email}`);
    return true;
  }

  /**
   * Remove expired OTPs from memory to free up space
   */
  private cleanupExpiredOTPs(): void {
    const now = new Date();
    let cleanedCount = 0;

    // Check each stored OTP
    for (const [email, otpData] of this.otpStorage.entries()) {
      // If OTP is expired, remove it
      if (otpData.expiresAt < now) {
        this.otpStorage.delete(email);
        cleanedCount++;
      }
    }

    // Log cleanup results
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired OTPs`);
    }
  }

  /**
   * Get OTP expiry time in minutes (for API responses)
   * @returns {number} Expiry time in minutes
   */
  getOTPExpiryMinutes(): number {
    return this.OTP_EXPIRY_MINUTES;
  }

  /**
   * Get maximum allowed attempts (for API responses)
   * @returns {number} Maximum attempts allowed
   */
  getMaxAttempts(): number {
    return this.MAX_ATTEMPTS;
  }
}

// Database schema for registration OTPs (if using database storage)
export const RegistrationOTPSchema = `
  CREATE TABLE IF NOT EXISTS registration_otps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_expires_at (expires_at)
  );
`;

// Create a single instance of the service (singleton pattern)
export const otpService = new OTPService();