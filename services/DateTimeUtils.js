const dayjs = require('dayjs');
require('dayjs-ext');
dayjs.timeZone = 'Asia/Singapore';
const TodayDateString = () => {
  return dayjs().format('YYYY-MM-DD');
};

const TimeNowString = () => {
  return dayjs().format('HHmmss');
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
  TimeNowString,
  TodayDate,
  TimeNow,
  TimestampNow,
};
