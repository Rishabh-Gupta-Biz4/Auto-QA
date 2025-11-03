import { useForm } from 'react-hook-form';
import { useState, useRef } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  
  const form = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    // Use ref for immediate check (synchronous), state for UI updates (asynchronous)
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }
    
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const success = await login(data.email, data.password);
      if (!success) {
        form.setError('root', {
          type: 'manual',
          message: 'Invalid email or password'
        });
      }
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: 'Login failed. Please try again.'
      });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Return form with custom isSubmitting in formState
  // Use Object.assign to maintain reactivity of formState
  const formWithState = {
    ...form,
    formState: {
      ...form.formState,
      isSubmitting,
    },
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting, // Also expose directly for easier access
  };
  
  return formWithState;
}

// Register Form Hook
export function useRegisterForm(onSuccess?: () => void) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  
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
    // Use ref for immediate check (synchronous), state for UI updates (asynchronous)
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }
    
    isSubmittingRef.current = true;
    setIsSubmitting(true);
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
      } else {
        form.setError('root', {
          type: 'manual',
          message: result.message || 'Registration failed'
        });
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    } catch (error) {
      form.setError('root', {
        type: 'manual',
        message: 'Registration failed. Please try again.'
      });
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // Return form with custom isSubmitting in formState
  // Use Object.assign to maintain reactivity of formState
  const formWithState = {
    ...form,
    formState: {
      ...form.formState,
      isSubmitting,
    },
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting, // Also expose directly for easier access
  };
  
  return formWithState;
}
