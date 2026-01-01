import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

export const S3UatUrl = 'https://playuniteduat.s3.ap-southeast-1.amazonaws.com/';
export const S3ProdUrl = 'https://playunitedprod.s3.ap-southeast-1.amazonaws.com/';
const uatUrl = 'https://uat.mobile.playunitedsg.com';
const prodUrl = 'https://mobile.playunitedsg.com';

const PHYSICAL_DEVICE_IP = '192.168.1.199';

function resolveDevApiUrl() {
  const isEmulator = DeviceInfo.isEmulatorSync();
  return isEmulator ? 'http://10.0.2.2:5000' : `http://${PHYSICAL_DEVICE_IP}:5000`;
}

const ENVURL = {
  dev: {
    envName: 'DEV',
    apiUrl: resolveDevApiUrl(),
    s3Url: S3UatUrl,
  },
  uat: {
    envName: 'UAT',
    apiUrl: uatUrl,
    s3Url: S3UatUrl,
  },
  prod: {
    envName: 'PROD',
    apiUrl: prodUrl,
    s3Url: S3ProdUrl,
  },
};

function getEnvironment() {
  if (process.env.ENV === 'PROD') {
    return ENVURL.prod;
  } else if (process.env.ENV === 'UAT') {
    return ENVURL.uat;
  } else {
    return ENVURL.dev;
  }
}

export default getEnvironment;
