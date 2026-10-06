# 1. Build Stage
FROM ubuntu:22.04 AS builder
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean
WORKDIR /app
COPY . .
RUN chmod +x build.sh && ./build.sh

# 2. Run Stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/backend/build/libs/app.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
