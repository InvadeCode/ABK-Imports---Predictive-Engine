import http from 'http';
import https from 'https';

https.get('https://abkimports.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const matches = data.match(/#[0-9a-fA-F]{6}/g);
    const unique = [...new Set(matches)];
    console.log(unique);
  });
});
