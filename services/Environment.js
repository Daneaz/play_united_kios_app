export const S3UatUrl =
  'https://playuniteduat.s3.ap-southeast-1.amazonaws.com/';
export const S3ProdUrl =
  'https://playunitedprod.s3.ap-southeast-1.amazonaws.com/';
const uatUrl = 'https://uat.mobile.playunitedsg.com';
const prodUrl = 'https://mobile.playunitedsg.com';
const ENVURL = {
  dev: {
    envName: 'DEV',
    apiUrl: 'http://192.168.1.199:5000',
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
  console.log('ENV: ', process.env.ENV);
  if (process.env.ENV === 'PROD') {
    return ENVURL.prod; // prod env settings
  } else if (process.env.ENV === 'UAT') {
    return ENVURL.uat; // stage env settings
  } else {
    return ENVURL.dev; // dev env settings
  }
}

export default getEnvironment();
