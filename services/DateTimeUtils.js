const dayjs = require('dayjs');
require('dayjs-ext');
dayjs.timeZone = 'Asia/Singapore';
const TodayDateString = () => {
  return dayjs().format('YYYY-MM-DD');
};

const TimeStampTo10Digits = () => {
  return Math.floor(dayjs().valueOf() / 1000);
};

const TodayDate = () => {
  return dayjs(dayjs().format('YYYY-MM-DD')).toDate();
};

const TimeNow = () => {
  return dayjs().toDate();
};

const TimestampNow = () => {
  return dayjs().valueOf();
};

module.exports = {
  TodayDateString,
  TimeStampTo10Digits: TimeStampTo10Digits,
  TodayDate,
  TimeNow,
  TimestampNow,
};
