import {StyleSheet} from 'react-native';
import Colors from './Colors';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputContainer: {
    flex: 1,
    gap: 20,
  },
  reportContainLayout: {
    gap: 10,
    marginHorizontal: 10,
  },
  inputContainLayout: {
    gap: 5,
  },
  rowCenterContent: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    fontSize: 17,
  },
  iOSBlueText: {
    fontSize: 17,
    color: Colors.iosBlue,
  },
  errorText: {
    color: Colors.error,
    paddingHorizontal: 15,
  },
  smallText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
});
