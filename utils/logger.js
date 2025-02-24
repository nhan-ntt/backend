import * as winston from 'winston';
// import * as path from 'path';
import * as moment from 'moment';
// require('winston-daily-rotate-file');
// import { NODE_ENV } from '../../environment';
// import { uploadFile } from '../s3/s3';

const myFormat = winston.format.printf(({ level, message, label, timestamp }) => {
  console.log(`${timestamp} [${label}] ${level}:`)
  console.log(message)
  return ''
});
const jsonFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `{"timestamp":"${timestamp}","level":"${level}","message":${JSON.stringify(message)}}`;
});
// const transport = new winston.transports.DailyRotateFile({
//   filename: '/app/app/log/%DATE%_production.log',
//   datePattern: 'YYYY-MM-DD',
//   zippedArchive: true,
//   maxSize: '20m',
//   maxFiles: '14d',
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     jsonFormat
//   ),

// })

// transport.on('rotate', (oldFileName, newFileName) => {
//   uploadFile(path.resolve(__dirname, '../..', `./log/${oldFileName}`), `log/${oldFileName}`)
//   console.log('Create new log file: ',newFileName)
// })

const log = winston.createLogger({
    transports: [
    // info console log
    new (winston.transports.Console)({
      level: 'info',
      name: 'info-console',
      colorize: true,
      format: winston.format.combine(
        winston.format.label({label: 'Backend'}),
        winston.format.timestamp(),
        myFormat
      ),
      timestamp: () => moment().format('YYYY-MM-DD HH-mm-ss'),
      formatter: options => `[${options.timestamp()}]: ${options.message || ''}`
    }),
    // // errors console log
    new (winston.transports.Console)({
      level: 'error',
      name: 'error-console',
      colorize: true,
      format: winston.format.combine(
        winston.format.label({label: 'Backend'}),
        winston.format.timestamp(),
        myFormat
      ),
      timestamp: () => moment().format('YYYY-MM-DD HH-mm-ss'),
      formatter: options => `[${options.timestamp()}]: ${options.message || ''}`
    }),
    // errors log file
    
  ]
});

// if (NODE_ENV === 'production' || true) {
//   // log.add(transport)
// }

// export default log;
export { log };