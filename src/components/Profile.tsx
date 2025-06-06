import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Overview */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              textAlign: 'center',
              border: '1px solid #eee',
              borderRadius: '8px'
            }}
          >
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: '#dc2626',
                fontSize: '3rem',
                margin: '0 auto 16px'
              }}
            >
              {user.name[0]}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'inline-block',
                  bgcolor: '#dc2626',
                  color: 'white',
                  px: 2,
                  py: 0.5,
                  borderRadius: '4px'
                }}
              >
                Active Donor
              </Typography>
              <Button
                component={Link}
                to="/profile/edit"
                startIcon={<EditIcon />}
                variant="outlined"
                size="small"
                sx={{
                  borderColor: '#dc2626',
                  color: '#dc2626',
                  '&:hover': {
                    borderColor: '#b91c1c',
                    bgcolor: 'rgba(220, 38, 38, 0.04)'
                  }
                }}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3,
              border: '1px solid #eee',
              borderRadius: '8px'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ color: '#dc2626' }}>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <PersonIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Full Name" 
                  secondary={user.name} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <EmailIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email Address" 
                  secondary={user.email} 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <LocalHospitalIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Blood Type" 
                  secondary="A+ (Update your blood type)" 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Location" 
                  secondary="Kathmandu, Nepal (Update your location)" 
                />
              </ListItem>
            </List>

            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#dc2626' }}>
                Donation History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                No donation history available yet.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 