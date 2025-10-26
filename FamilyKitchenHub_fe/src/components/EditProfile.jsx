import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Checkbox,
    FormControlLabel,
    Avatar,
    Card,
    CardContent,
    Grid
} from '@mui/material';
import { Edit, Email } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../styles/EditProfile.css';

const EditProfile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: 'Pk',
        email: 'pk@gmail.com',
        gender: '',
        pathology: '',
        numberOfFamilyMembers: 1,
        country: '',
        favorite: 'Vegetarian',
        ageGroups: {
            children: true,
            teenagers: true,
            adult: false,
            oldPerson: false
        }
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAgeGroupChange = (field) => {
        setFormData(prev => ({
            ...prev,
            ageGroups: {
                ...prev.ageGroups,
                [field]: !prev.ageGroups[field]
            }
        }));
    };

    const handleSubmit = () => {
        console.log('Save profile:', formData);
        alert('Profile updated successfully!');
        navigate('/manage/Dashboard');
    };

    return (
        <Box className="edit-profile-container">
            <Box className="profile-wrapper">
                <Box className="profile-header">
                    {/* User Info */}
                    <Box className="user-info-section">
                        <Avatar
                            src="https://images.unsplash.com/photo-1522770179533-24471fcdba45"
                            sx={{ width: 64, height: 64, border: '3px solid white' }}
                        />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {formData.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {formData.email}
                        </Typography>
                    </Box>
                    </Box>
                    <Button
                        variant="contained"
                        className="save-button"
                        startIcon={<Edit />}
                        onClick={handleSubmit}
                    >
                        Save
                    </Button>
                </Box>

                {/* Form Content */}
                <Card className="form-card">
                <CardContent className="form-card-content">
                    <Grid container spacing={10} className="form-grid">
                        {/* Left Column */}
                        <Grid item xs={12} md={6} className="form-column">
                            <Typography variant="h6" className="section-title">
                                Personal Details
                            </Typography>

                            <TextField
                                fullWidth
                                label="Full Name"
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                placeholder="Your First Name"
                                sx={{ 
                                    mb: 3,
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center'
                                    }
                                }}
                            />

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    label="Gender"
                                    value={formData.gender}
                                    onChange={(e) => handleChange('gender', e.target.value)}
                                    placeholder="Your First Name"
                                    sx={{
                                        '& .MuiSelect-select': {
                                            textAlign: 'center'
                                        }
                                    }}
                                >
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Pathology</InputLabel>
                                <Select
                                    label="Pathology"
                                    value={formData.pathology}
                                    onChange={(e) => handleChange('pathology', e.target.value)}
                                    placeholder="allergy...."
                                    sx={{
                                        '& .MuiSelect-select': {
                                            textAlign: 'center'
                                        }
                                    }}
                                >
                                    <MenuItem value="allergy">Allergy</MenuItem>
                                    <MenuItem value="diabetes">Diabetes</MenuItem>
                                    <MenuItem value="hypertension">Hypertension</MenuItem>
                                    <MenuItem value="none">None</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="your.email@example.com"
                                sx={{ 
                                    mb: 3,
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center'
                                    }
                                }}
                                InputProps={{
                                    startAdornment: <Email sx={{ color: '#1976d2', mr: 1 }} />
                                }}
                            />
                        </Grid>

                        {/* Right Column */}
                        <Grid item xs={12} md={6} className="form-column">
                            <Typography variant="h6" className="section-title">
                                Family and Preferences
                            </Typography>

                            <TextField
                                fullWidth
                                label="Number of family members"
                                type="number"
                                value={formData.numberOfFamilyMembers}
                                onChange={(e) => handleChange('numberOfFamilyMembers', e.target.value)}
                                inputProps={{ min: 1 }}
                                sx={{ 
                                    mb: 3,
                                    '& .MuiInputBase-input': {
                                        textAlign: 'center'
                                    }
                                }}
                            />

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Country</InputLabel>
                                <Select
                                    label="Country"
                                    value={formData.country}
                                    onChange={(e) => handleChange('country', e.target.value)}
                                    placeholder="Your First Name"
                                    sx={{
                                        '& .MuiSelect-select': {
                                            textAlign: 'center'
                                        }
                                    }}
                                >
                                    <MenuItem value="vietnam">Vietnam</MenuItem>
                                    <MenuItem value="usa">United States</MenuItem>
                                    <MenuItem value="uk">United Kingdom</MenuItem>
                                    <MenuItem value="france">France</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth sx={{ mb: 3 }}>
                                <InputLabel>Favorite</InputLabel>
                                <Select
                                    label="Favorite"
                                    value={formData.favorite}
                                    onChange={(e) => handleChange('favorite', e.target.value)}
                                    sx={{
                                        '& .MuiSelect-select': {
                                            textAlign: 'center'
                                        }
                                    }}
                                >
                                    <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                                    <MenuItem value="Vegan">Vegan</MenuItem>
                                    <MenuItem value="Meat Lover">Meat Lover</MenuItem>
                                    <MenuItem value="Balanced">Balanced</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Age Groups */}
                            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                                Age of family members:
                            </Typography>
                            
                            <Box className="checkbox-group">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.ageGroups.children}
                                            onChange={() => handleAgeGroupChange('children')}
                                        />
                                    }
                                    label="Children (1-12 Year olds)"
                                    sx={{ width: 'fit-content' }}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.ageGroups.teenagers}
                                            onChange={() => handleAgeGroupChange('teenagers')}
                                        />
                                    }
                                    label="Teenagers (13-18 Year olds)"
                                    sx={{ width: 'fit-content' }}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.ageGroups.adult}
                                            onChange={() => handleAgeGroupChange('adult')}
                                        />
                                    }
                                    label="Adult (19-60 Year olds)"
                                    sx={{ width: 'fit-content' }}
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={formData.ageGroups.oldPerson}
                                            onChange={() => handleAgeGroupChange('oldPerson')}
                                        />
                                    }
                                    label="Old person (>60 Year olds)"
                                    sx={{ width: 'fit-content' }}
                                />
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            </Box>
        </Box>
    );
};

export default EditProfile;

