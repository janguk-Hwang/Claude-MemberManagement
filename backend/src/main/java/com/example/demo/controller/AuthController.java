package com.example.demo.controller;

import com.example.demo.dto.Dtos.*;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.MemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final MemberService memberService;

    public AuthController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        try {
            return ResponseEntity.ok(MemberService.toResponse(memberService.signup(request)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(memberService.login(request));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails d) {
            memberService.logout(d.getMember().getId());
        }
        return ResponseEntity.ok().build();
    }

    /** true = 사용 가능 */
    @GetMapping("/check-name")
    public ResponseEntity<Boolean> checkName(@RequestParam String name) {
        return ResponseEntity.ok(memberService.isNameAvailable(name));
    }
}
