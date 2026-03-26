FROM nginx:alpine
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY index.html style.css app.js NEDER.jpg /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
