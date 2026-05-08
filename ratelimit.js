import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 50,
  duration: '20s',
};

export default function () {
  let res = http.get('https://auracut.duckdns.org/');

  check(res, {
    'status is 200 or 429': (r) =>
      r.status === 200 || r.status === 429,
  });
}