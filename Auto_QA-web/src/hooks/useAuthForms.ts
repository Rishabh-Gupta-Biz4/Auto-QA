import { useForm } from 'react-hook-form';
import { useRef } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/contexts/auth-context';
import { useAppDispatch } from '@/redux/hooks';
import { setPendingRegistration } from '@/redux/slices/registrationSlice';
import { 
  loginSchema, 
  registerSchema,
  type LoginFormData,
  type RegisterFormData
} from '@/validations/auth.schemas';

// Login Form Hook
export function useLoginForm() {
  const { login } = useAuth();
  const submittingRef = useRef(false);
  
  const form = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    if (submittingRef.current) {
      return false;
    }
    submittingRef.current = true;
    try {
      const success = await login(data.email, data.password);
      if (!success) {
        form.setError('root', {
          type: 'manual',
          message: 'Invalid email or password'
        });
      }
      return success;
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: 'Login failed. Please try again.'
      });
      return false;
    } finally {
      submittingRef.current = false;
    }
  };

  return {
    ...form,
    onSubmit: form.handleSubmit(onSubmit)
  };
}

// Register Form Hook
export function useRegisterForm(onSuccess?: () => void) {
  const dispatch = useAppDispatch();
  const submittingRef = useRef(false);
  
  const form = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
      role: 'qa_engineer'
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (submittingRef.current) {
      return { success: false, error: 'Already submitting' };
    }
    submittingRef.current = true;
    try {
      const response = await fetch('http://localhost:3001/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          password: data.password,
          role: data.role || 'qa_engineer'
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store registration data in Redux for OTP verification
        const registrationData = {
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          password: data.password,
          role: data.role || 'qa_engineer'
        };
        
        // Dispatch to Redux store
        dispatch(setPendingRegistration(registrationData));
        
        // Redirect to OTP verification page
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(registrationData);
          window.location.href = `/verify-otp?${params.toString()}`;
        }
        
        return { success: true, data: result.data };
      } else {
        form.setError('root', {
          type: 'manual',
          message: result.message || 'Registration failed'
        });
        return { success: false, error: result.message };
      }
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: 'Registration failed. Please try again.'
      });
      return { success: false, error: 'Network error' };
    } finally {
      submittingRef.current = false;
    }
  };

  return {
    ...form,
    onSubmit: form.handleSubmit(onSubmit)
  };
}
