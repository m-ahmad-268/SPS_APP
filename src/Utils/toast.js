import Toast from 'react-native-root-toast';

const showToast = (message, type = 'success') => {
  let backgroundColor;
  let textColor = 'white';

  switch (type) {
    case 'success':
      backgroundColor = '#ffffff';
      textColor = 'black';
      break;
    case 'error':
      backgroundColor = '#dc3545'; // Red   
      break;
    case 'warning':
      backgroundColor = '#ffc107'; // Yellow
      textColor = 'black';
      break;
    default:
      backgroundColor = '#ffffff'; // Default color
      textColor = 'black';
  }

  Toast.show(message, {
    duration: Toast.durations.LONG,
    position: Toast.positions.TOP + 18,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    backgroundColor: backgroundColor,
    textColor: textColor,
    shadowColor: '#321953',
    opacity: 1,
  });
};

export default showToast;
