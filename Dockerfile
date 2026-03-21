FROM nginx:alpine

# Dev mode: build once, mount source code at runtime.
# This avoids rebuilding the image after each HTML/CSS/JS change.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]