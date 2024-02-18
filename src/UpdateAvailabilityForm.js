import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Grid,
  AppBar,
  Toolbar,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { styled } from '@mui/material/styles';

const StyledTextField = styled(TextField)`
  margin-bottom: 20px;
  & .MuiOutlinedInput-root {
    &.Mui-focused fieldset {
      border-color: #e0f2f1;
    }
    &:hover fieldset {
      border-color: teal;
    }
  }
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
  background-color: #e74c3c;
  color: #ffffff;
  &:hover {
    background-color: #c0392b;
  }
`;

const StyledTimeIcon = styled(AccessTimeIcon)`
  color: #e74c3c;
  margin-right: 10px;
`;

const Header = styled(AppBar)`
  background-color: #e74c3c;
`;

const Title = styled(Typography)`
  color: #ffffff;
  flex-grow: 1;
`;

const Footer = styled(Box)`
  margin-top: 20px;
`;

const FooterText = styled(Typography)`
  color: #888;
`;

const UpdateAvailabilityForm = () => {
  const [posBarcode, setPosBarcode] = useState('');
  const [posPortable, setPosPortable] = useState('');
  const [startAvailability, setStartAvailability] = useState('');
  const [endAvailability, setEndAvailability] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('');

  function validatePosBarcode(value) {
    return /^\d{12}$/.test(value);
  }
  
  function validatePhoneNumber(value) {
    return /^\d{8}$/.test(value);
  }
  
  async function handleValidation() {
    if (!validatePosBarcode(posBarcode) || !validatePhoneNumber(posPortable)) {
      setAlertMessage(
        'Le numéro de colis doit contenir 12 chiffres exactement et le numéro de téléphone doit contenir 8 chiffres exactement. Veuillez vérifier les valeurs.'
      );
      setAlertSeverity('error');
      return false;
    }
    
    try {
      const response = await axios.get(
        `http://fparcel.net:59/WebServiceExterne/tracking_position_STG?POSBARCODE=${posBarcode}&POSPORTABLE=${posPortable}`
      );
  
      if (response.data === 'inexistant') {
        setAlertMessage(
          "La combinaison numéro de colis et numéro de téléphone n'est pas valide."
        );
        setAlertSeverity('error');
        return false;
      }
  
      return true;
    } catch (error) {
      console.error('Validation Error:', error);
      setAlertMessage(
        "Une erreur s'est produite lors de la validation. Veuillez réessayer plus tard."
      );
      setAlertSeverity('error');
      return false;
    }
  }
  

  function handleInputChange(event, setInputValue) {
    const inputValue = event.target.value;
    const numericValue = inputValue.replace(/\D/g, '');
    setInputValue(numericValue);
  }
  

 async function handleSubmit(event) {
  event.preventDefault();

  if (!posBarcode || !posPortable || !startAvailability || !endAvailability) {
    setAlertMessage('Veuillez remplir tous les champs.');
    setAlertSeverity('error');
    return;
  }

  if (startAvailability >= endAvailability) {
    setAlertMessage(
      "L'heure de disponibilité jusqu'à doit être supérieure à l'heure de disponibilité de début."
    );
    setAlertSeverity('error');
    return;
  }

  setIsSubmitting(true);

  try {
    const isValidationSuccessful = await handleValidation();

    if (!isValidationSuccessful) {
      setIsSubmitting(false);
      return;
    }

    const response = await axios.post(
      'http://fparcel.net:59/WebServiceExterne/update_availability_STG',
      {
        POSBARCODE: posBarcode,
        POSPORTABLE: posPortable,
        DISP_DU: startAvailability,
        DISP_AU: endAvailability,
      }
    );

    if (response.data === 'success') {
      setAlertMessage('Disponibilité mise à jour avec succès.');
      setAlertSeverity('success');
      resetFormFields();
    } else {
      setAlertMessage(
        "Une erreur s'est produite lors de la mise à jour de la disponibilité."
      );
      setAlertSeverity('error');
    }
  } catch (error) {
    console.error('API Error:', error);
    setAlertMessage(
      "Une erreur s'est produite lors de la mise à jour de la disponibilité. Veuillez réessayer plus tard."
    );
    setAlertSeverity('error');
  } finally {
    setIsSubmitting(false);
  }
}

  const resetFormFields = () => {
    setPosBarcode('');
    setPosPortable('');
    setStartAvailability('');
    setEndAvailability('');
  };

  const handleCloseAlert = () => {
    setAlertMessage('');
  };

  return (
    <div className="availability-form-container">
      <Header position="static">
        <Toolbar>
          <Title variant="h6" component="div">
            Service de Livraison - Mise à Jour de Disponibilité
          </Title>
        </Toolbar>
      </Header>
      <Container maxWidth="sm">
        <Box mt={5} p={3} boxShadow={3} bgcolor="#f7f7f7" borderRadius={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" align="center" gutterBottom>
                Mettre à Jour la Disponibilité du Colis
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <form onSubmit={handleSubmit}>
                <StyledTextField
                  label="Numéro de Colis (Code à barres)"
                  fullWidth
                  value={posBarcode}
                  onChange={(e) => handleInputChange(e, setPosBarcode)}
                  required
                  variant="outlined"
                  margin="normal"
                  placeholder="Ex: 123456789012"
                  color="success"
                  inputProps={{ maxLength: 12 }}
                />

                <StyledTextField
                  label="Numéro de Téléphone"
                  fullWidth
                  value={posPortable}
                  onChange={(e) => handleInputChange(e, setPosPortable)}
                  required
                  variant="outlined"
                  margin="normal"
                  placeholder="Ex: 06123456"
                  color="success"
                  inputProps={{ maxLength: 8 }}
                />

                <StyledTextField
                  label="Heure de Disponibilité de"
                  fullWidth
                  type="time"
                  value={startAvailability}
                  onChange={(e) => setStartAvailability(e.target.value)}
                  required
                  inputProps={{ step: 300 }}
                  variant="outlined"
                  margin="normal"
                  color="success"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StyledTimeIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <StyledTextField
                  label="Heure de Disponibilité jusqu'à"
                  fullWidth
                  type="time"
                  value={endAvailability}
                  onChange={(e) => setEndAvailability(e.target.value)}
                  required
                  inputProps={{ step: 300 }}
                  variant="outlined"
                  margin="normal"
                  color="success"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <StyledTimeIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <StyledButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Mettre à Jour'}
                </StyledButton>
              </form>
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Snackbar open={!!alertMessage} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <Footer mt={3}>
        <FooterText variant="body2" align="center" color="textSecondary" component="p">
          © {new Date().getFullYear()} Service de Livraison. Tous droits réservés.
        </FooterText>
      </Footer>
    </div>
  );
};

export default UpdateAvailabilityForm;
