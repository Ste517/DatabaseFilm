@echo off
echo Building Docker image...
docker build -t webappposti .
echo.
echo Docker image 'webappposti' built successfully.
echo.
echo To run the image, use:
echo docker run -p 8000:8000 webappposti
echo.
echo To save the image to a file for sharing:
echo docker save -o webappposti.tar webappposti
echo.
pause
