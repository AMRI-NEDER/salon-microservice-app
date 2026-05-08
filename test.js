import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 30,          // 30 users فقط
  duration: '20s',  // مدة قصيرة
};

export default function () {
  let res = http.get('https://auracut.duckdns.org/');

  check(res, {
    'status ok': (r) => r.status === 200 || r.status === 429,
  });
}