import * as yup from 'yup';

export const signUpSchema = yup.object().shape({
  isCustomer: yup.boolean(),
  country: yup.string().label('Country').required('Please select a country...'),
  countryCode: yup
    .string()
    .label('Country')
    .required('Please select a country...'),
  mobile: yup
    .string()
    .label('Mobile')
    .min(8)
    .max(11)
    .required('Please enter mobile number...'),
  password: yup
    .string()
    .label('Password')
    .required('Please enter password!!')
    .min(6, 'Password require minimum 6 alphanumeric characters...'),
  confirmPassword: yup
    .string()
    .label('Confirm Password')
    .required('Please enter password!!')
    .min(6, 'Password require minimum 6 alphanumeric characters...')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
  displayName: yup
    .string()
    .label('Name')
    .required('Please enter a name...')
    .min(4, 'Name is too short...'),
  email: yup
    .string()
    .email()
    .label('Email')
    .min(6, 'Email is too short...')
    .when('isCustomer', {
      is: true,
      then: yup.string().required('Please enter email address...'),
    }),
  birthday: yup
    .string()
    .label('Birthday')
    .when('isCustomer', {
      is: true,
      then: yup.string().required('Please select birthday...'),
    }),
});

export const editStaffSchema = yup.object().shape({
  mobile: yup.string().min(8).max(11).required('Please enter mobile number...'),
  displayName: yup
    .string()
    .label('Name')
    .required('Please enter a name...')
    .min(4, 'Name is too short...'),
});

export const mobileSchema = yup.object().shape({
  mobile: yup.string().min(8).max(11).required('Please enter mobile number...'),
});

export const nameSchema = yup.object().shape({
  displayName: yup
    .string()
    .label('Name')
    .max(50)
    .required('Please enter name...'),
});

export const createCategorySchema = yup.object().shape({
  name: yup.string().label('Name').required('Please enter category name...'),
});

export const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .label('Email')
    .required('Please enter email address...')
    .min(6, 'Email is too short...'),
});

export const passwordSchema = yup.object().shape({
  password: yup.string().label('Password').required('Please enter password...'),
});

export const changePasswordSchema = yup.object().shape({
  password: yup
    .string()
    .label('New Password')
    .required('Please enter password...')
    .min(6, 'Password require minimum 6 alphanumeric characters...'),
  rePassword: yup
    .string()
    .label('Confirm Password')
    .required('Please enter password!!')
    .min(6, 'Password require minimum 6 alphanumeric characters...')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

export const otpVerifySchema = yup.object().shape({
  otp: yup.string().label('OTP').min(6).required('Please enter OTP code...'),
});

export const loginSchema = yup.object().shape({
  mobile: yup
    .string()
    .label('Mobile')
    .required('Please enter mobile number...'),
  password: yup.string().label('Password').required('Please enter password...'),
});

export const pointSchema = yup.object().shape({
  showOutlet: yup.boolean(),
  mobile: yup
    .string()
    .label('Mobile')
    .min(8)
    .max(11)
    .required('Please enter mobile number...'),
  value: yup.number().label('Value').required('Please enter value...'),
  outlet: yup
    .string()
    .label('Outlet')
    .when('showOutlet', {
      is: true,
      then: yup.string().required('Please select an outlet...'),
    }),
  remark: yup.string().label('Remark').required('Please enter remark...'),
});

export const productSchema = yup.object().shape({
  productCode: yup
    .string()
    .label('Product Code')
    .required('Please enter product code...'),
  category: yup
    .string()
    .label('Category')
    .required('Please select a category...'),
  name: yup.string().label('Name').required('Please enter product name...'),
  sellingPrice: yup
    .string()
    .label('Selling Price')
    .required('Please enter selling price...'),
  points: yup
    .string()
    .label('Redeem Points ')
    .required('Please enter redeem points...'),
  description: yup
    .string()
    .label('Description')
    .required('Please enter description...'),
});

export const inventoryCheckSchema = yup.object().shape({
  outlet: yup.string().label('Outlet').required('Please select a store...'),
  remark: yup.string().label('Remark').required('Please enter remark...'),
});

export const outletSchema = yup.object().shape({
  name: yup.string().label('Name').required('Please enter outlet name...'),
  address: yup
    .string()
    .label('Name')
    .required('Please enter outlet address...'),
});

export const promotionSchema = yup.object().shape({
  name: yup
    .string()
    .label('Promotion Name')
    .max(64)
    .required('Enter the promotion name here...'),
  sellingPrice: yup
    .number()
    .label('Promotion Price')
    .required('Enter the promotion price here...'),
  tokens: yup
    .number()
    .label('Number of tokens')
    .required('Enter the number of tokens here...'),
  expireDate: yup
    .date()
    .label('Expire date')
    .required('Select an expire date...'),
});

export const broadcastSchema = yup.object().shape({
  title: yup
    .string()
    .label('Title')
    .required('Enter the notification title here...'),
  msg: yup
    .string()
    .label('Message')
    .required('Enter the notification message here...'),
  countryCode: yup
    .string()
    .label('Country')
    .required('Please select a country...'),
});

export const updateWorkingLocationSchema = yup.object().shape({
  outlet: yup.string().label('Outlet').required('Please select an outlet...'),
  staff: yup.string().label('Staff').required('Please select a staff...'),
});
