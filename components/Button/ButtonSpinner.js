import {Button, Spinner} from '@ui-kitten/components';
import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';

export default function ButtonSpinner(props) {
  const {
    onPress,
    appearance,
    status,
    spinnerStatus,
    accessoryLeft,
    style,
    isSubmitting,
    children,
  } = props;

  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    setShowIndicator(isSubmitting);
  }, [isSubmitting]);

  function handlerOnPress() {
    setShowIndicator(true);
    setTimeout(() => {
      setShowIndicator(false);
    }, 1000);
    onPress();
  }

  const LoadingIndicator = (
    <View style={styles.indicator}>
      <Spinner size="small" status={spinnerStatus ? spinnerStatus : 'info'} />
    </View>
  );

  return (
    <Button
      accessoryLeft={accessoryLeft && accessoryLeft}
      accessoryRight={showIndicator && LoadingIndicator}
      disabled={showIndicator}
      appearance={appearance ? appearance : 'filled'}
      style={style}
      status={status ? status : 'primary'}
      onPress={() => handlerOnPress()}>
      {children}
    </Button>
  );
}

ButtonSpinner.propTypes = {
  onPress: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
