FROM node:20 AS b
WORKDIR /a
COPY . .
RUN npm i && npm run build
FROM nginx:alpine
COPY --from=b /a/dist /usr/share/nginx/html
RUN printf 'server{listen 80;location /api/{proxy_pass http://backend:8080;}location /{root /usr/share/nginx/html;try_files $uri /index.html;}}' > /etc/nginx/conf.d/default.conf
