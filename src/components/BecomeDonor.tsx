import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
  TextField,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormGroup,
  FormHelperText,
  Alert,
  CircularProgress,
  SelectChangeEvent,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { red } from '@mui/material/colors';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { useAuth } from '../context/AuthContext';
import { donorService } from '../services/api';
import type { DonorFormData } from '../services/api';
import { useNavigate } from 'react-router-dom';

const steps = ['Personal Information', 'Medical History', 'Confirmation'];

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(3),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  [theme.breakpoints.up(600 + Number(theme.spacing(3)) * 2)]: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(6),
    padding: theme.spacing(3),
  },
}));

const BecomeDonor: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState<DonorFormData>({
    name: user?.name || '',
    phone: user?.phone || '',
    blood_type: user?.blood_type || '',
    address: user?.address || '',
    date_of_birth: '',
    weight: '',
    height: '',
    last_donation: '',
    medical_conditions: [],
    medications: '',
    agreement: false,
    health_status: '',
  });

  const validateStep = (step: number) => {
    const errors: Record<string, string> = {};
    const step0Fields = ['name', 'phone', 'blood_type', 'address', 'date_of_birth'];
    const step1Fields = ['weight', 'height', 'last_donation', 'medical_conditions', 'medications', 'health_status'];
    const step2Fields = ['agreement'];

    const isFieldInCurrentStep = (field: keyof DonorFormData) => {
      if (step === 0) return step0Fields.includes(field);
      if (step === 1) return step1Fields.includes(field);
      if (step === 2) return step2Fields.includes(field);
      return false;
    };

    Object.entries(formData).forEach(([field, value]) => {
      if (!isFieldInCurrentStep(field as keyof DonorFormData)) return;

      if (!value && field !== 'medical_conditions') {
        errors[field] = 'This field is required';
      }

      if (field === 'phone' && !/^\+?[\d\s-]{10,}$/.test(value as string)) {
        errors[field] = 'Please enter a valid phone number';
      }

      if (field === 'date_of_birth') {
        const date = new Date(value as string);
        const age = new Date().getFullYear() - date.getFullYear();
        if (age < 18) {
          errors[field] = 'You must be at least 18 years old to donate blood';
        }
      }

      if (field === 'weight' && parseInt(value as string) < 50) {
        errors[field] = 'You must weigh at least 50kg to donate blood';
      }

      if (field === 'agreement' && !value) {
        errors[field] = 'You must agree to the terms and conditions';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(activeStep)) return;

    if (activeStep === steps.length - 1) {
      setLoading(true);
      setError(null);
      try {
        await donorService.becomeDonor(formData);
        navigate('/profile');
      } catch (err: any) {
        if (err.response?.data?.errors) {
          setBackendErrors(err.response.data.errors);
        } else {
          setError(err.response?.data?.message || 'Failed to submit donor application');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleTextFieldChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev: DonorFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFormData((prev: DonorFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prev: DonorFormData) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleMedicalConditionsChange = (condition: string) => {
    setFormData((prev: DonorFormData) => ({
      ...prev,
      medical_conditions: prev.medical_conditions.includes(condition)
        ? prev.medical_conditions.filter(c => c !== condition)
        : [...prev.medical_conditions, condition]
    }));
  };

  const getFieldError = (fieldName: keyof DonorFormData) => {
    return formErrors[fieldName] || (backendErrors[fieldName]?.[0]) || '';
  };

  const PersonalInformationForm = () => (
    <Box>
      <TextField
        required
        fullWidth
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleTextFieldChange}
        error={!!getFieldError('name')}
        helperText={getFieldError('name')}
        margin="normal"
      />
      <TextField
        required
        fullWidth
        label="Phone Number"
        name="phone"
        value={formData.phone}
        onChange={handleTextFieldChange}
        error={!!getFieldError('phone')}
        helperText={getFieldError('phone')}
        margin="normal"
      />
      <FormControl fullWidth margin="normal" error={!!getFieldError('blood_type')}>
        <FormLabel>Blood Type</FormLabel>
        <Select
          required
          name="blood_type"
          value={formData.blood_type}
          onChange={handleSelectChange}
        >
          <MenuItem value="">Select Blood Type</MenuItem>
          <MenuItem value="A+">A+</MenuItem>
          <MenuItem value="A-">A-</MenuItem>
          <MenuItem value="B+">B+</MenuItem>
          <MenuItem value="B-">B-</MenuItem>
          <MenuItem value="AB+">AB+</MenuItem>
          <MenuItem value="AB-">AB-</MenuItem>
          <MenuItem value="O+">O+</MenuItem>
          <MenuItem value="O-">O-</MenuItem>
        </Select>
        <FormHelperText>{getFieldError('blood_type')}</FormHelperText>
      </FormControl>
      <TextField
        required
        fullWidth
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleTextFieldChange}
        error={!!getFieldError('address')}
        helperText={getFieldError('address')}
        margin="normal"
      />
      <TextField
        required
        fullWidth
        type="date"
        label="Date of Birth"
        name="date_of_birth"
        value={formData.date_of_birth}
        onChange={handleTextFieldChange}
        error={!!getFieldError('date_of_birth')}
        helperText={getFieldError('date_of_birth') || 'You must be at least 18 years old'}
        InputLabelProps={{ shrink: true }}
        margin="normal"
      />
    </Box>
  );

  const MedicalHistoryForm = () => (
    <Box>
      <TextField
        required
        fullWidth
        label="Weight (kg)"
        name="weight"
        type="number"
        value={formData.weight}
        onChange={handleTextFieldChange}
        error={!!getFieldError('weight')}
        helperText={getFieldError('weight') || 'Minimum weight required: 50kg'}
        margin="normal"
      />
      <TextField
        required
        fullWidth
        label="Height (cm)"
        name="height"
        type="number"
        value={formData.height}
        onChange={handleTextFieldChange}
        error={!!getFieldError('height')}
        helperText={getFieldError('height')}
        margin="normal"
      />
      <TextField
        required
        fullWidth
        type="date"
        label="Last Blood Donation Date (if any)"
        name="last_donation"
        value={formData.last_donation}
        onChange={handleTextFieldChange}
        error={!!getFieldError('last_donation')}
        helperText={getFieldError('last_donation')}
        InputLabelProps={{ shrink: true }}
        margin="normal"
      />
      <FormControl component="fieldset" margin="normal" error={!!getFieldError('medical_conditions')}>
        <FormLabel component="legend">Medical Conditions (if any)</FormLabel>
        <FormGroup>
          {['Diabetes', 'Hypertension', 'Heart Disease', 'HIV/AIDS', 'Hepatitis'].map((condition) => (
            <FormControlLabel
              key={condition}
              control={
                <Checkbox
                  checked={formData.medical_conditions.includes(condition)}
                  onChange={() => handleMedicalConditionsChange(condition)}
                />
              }
              label={condition}
            />
          ))}
        </FormGroup>
        <FormHelperText>{getFieldError('medical_conditions')}</FormHelperText>
      </FormControl>
      <TextField
        required
        fullWidth
        label="Current Medications"
        name="medications"
        value={formData.medications}
        onChange={handleTextFieldChange}
        error={!!getFieldError('medications')}
        helperText={getFieldError('medications')}
        margin="normal"
      />
      <FormControl component="fieldset" margin="normal" error={!!getFieldError('health_status')}>
        <FormLabel component="legend">Current Health Status</FormLabel>
        <RadioGroup
          name="health_status"
          value={formData.health_status}
          onChange={handleTextFieldChange}
        >
          <FormControlLabel value="excellent" control={<Radio />} label="Excellent" />
          <FormControlLabel value="good" control={<Radio />} label="Good" />
          <FormControlLabel value="fair" control={<Radio />} label="Fair" />
          <FormControlLabel value="poor" control={<Radio />} label="Poor" />
        </RadioGroup>
        <FormHelperText>{getFieldError('health_status')}</FormHelperText>
      </FormControl>
    </Box>
  );

  const ConfirmationForm = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Please review your information
      </Typography>
      <Typography variant="body1" paragraph>
        By checking the box below, you confirm that:
      </Typography>
      <Typography component="div">
        <ul>
          <li>All information provided is accurate and complete</li>
          <li>You are willing to donate blood when needed</li>
          <li>You understand the responsibilities of being a blood donor</li>
          <li>You agree to be contacted for blood donation requests</li>
        </ul>
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.agreement}
            onChange={handleCheckboxChange}
            name="agreement"
            color="primary"
          />
        }
        label="I agree to the terms and conditions"
      />
      {getFieldError('agreement') && (
        <FormHelperText error>{getFieldError('agreement')}</FormHelperText>
      )}
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <PersonalInformationForm />;
      case 1:
        return <MedicalHistoryForm />;
      case 2:
        return <ConfirmationForm />;
      default:
        throw new Error('Unknown step');
    }
  };

  return (
    <Container maxWidth="md">
      <StyledPaper>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Become a Blood Donor
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 4, mb: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
              endIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default BecomeDonor; 