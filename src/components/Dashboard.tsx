import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EditIcon from '@mui/icons-material/Edit';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const stats = [
    {
      label: 'Total Donations',
      value: '12',
      icon: <BloodtypeIcon sx={{ fontSize: 40, color: '#dc2626' }} />,
      color: '#dc2626'
    },
    {
      label: 'Lives Impacted',
      value: '36',
      icon: <FavoriteIcon sx={{ fontSize: 40, color: '#059669' }} />,
      color: '#059669'
    },
    {
      label: 'Last Donation',
      value: '2 months ago',
      icon: <CalendarTodayIcon sx={{ fontSize: 40, color: '#7c3aed' }} />,
      color: '#7c3aed'
    }
  ];

  const recentActivity = [
    {
      type: 'Donation',
      location: 'City Hospital',
      date: '2024-03-15',
      status: 'Completed'
    },
    {
      type: 'Request Response',
      location: 'Medical Center',
      date: '2024-02-28',
      status: 'Responded'
    },
    {
      type: 'Donation',
      location: 'Red Cross Center',
      date: '2024-01-10',
      status: 'Completed'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          color: 'white',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '2rem'
                  }}
                >
                  {user?.name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Welcome back, {user?.name?.split(' ')[0]}!
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <LocationOnIcon />
                    <Typography>{(user as any)?.city || 'Update your location'}</Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                Your blood type: {'Update your profile'}
              </Typography>
              <Button
                component={Link}
                to="/profile/edit"
                variant="contained"
                sx={{
                  bgcolor: 'white',
                  color: '#dc2626',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)'
                  }
                }}
                startIcon={<EditIcon />}
              >
                Edit Profile
              </Button>
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40%',
            height: '100%',
            background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            display: { xs: 'none', md: 'block' }
          }}
        />
      </Paper>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                borderRadius: 3,
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  bgcolor: `${stat.color}10`
                }}
              >
                {stat.icon}
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: stat.color, mb: 1 }}>
                {stat.value}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
            Recent Activity
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {recentActivity.map((activity, index) => (
              <React.Fragment key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: activity.type === 'Donation' ? '#dcfce7' : '#dbeafe',
                        color: activity.type === 'Donation' ? '#059669' : '#3b82f6'
                      }}
                    >
                      {activity.type === 'Donation' ? <BloodtypeIcon /> : <FavoriteIcon />}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {activity.type}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.location}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip
                      label={activity.status}
                      size="small"
                      sx={{
                        bgcolor: activity.status === 'Completed' ? '#dcfce7' : '#dbeafe',
                        color: activity.status === 'Completed' ? '#059669' : '#3b82f6',
                        fontWeight: 'medium'
                      }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                      {activity.date}
                    </Typography>
                  </Box>
                </Box>
                {index < recentActivity.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard; 