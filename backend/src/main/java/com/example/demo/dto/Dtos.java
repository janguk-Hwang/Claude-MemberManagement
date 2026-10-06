package com.example.demo.dto;

import java.time.LocalDate;

/** 요청/응답 DTO 모음 (SignupRequest, LoginRequest, AuthResponse 등) */
public final class Dtos {
    private Dtos() {}

    public record SignupRequest(String name, String password, String address,
                                LocalDate birthDate, String phone, String role) {}

    public record LoginRequest(String name, String password) {}

    public record AuthResponse(String token, Long id, String name, String role) {}

    public record UpdateRequest(String name, String address, LocalDate birthDate, String phone) {}

    public record MemberResponse(Long id, String name, String address,
                                 LocalDate birthDate, String phone, String role) {}
}
