package com.example.demo.security;

import com.example.demo.repository.MemberRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;
    private final MemberRepository memberRepository;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, MemberRepository memberRepository) {
        this.tokenProvider = tokenProvider;
        this.memberRepository = memberRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String name = tokenProvider.validateAndGetName(token);
            if (name != null) {
                memberRepository.findByName(name).ifPresent(member -> {
                    // 단일 기기 세션: 저장된 최신 토큰과 일치할 때만 인증
                    if (token.equals(member.getCurrentToken())) {
                        CustomUserDetails details = new CustomUserDetails(member);
                        SecurityContextHolder.getContext().setAuthentication(
                                new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities()));
                    }
                });
            }
        }
        chain.doFilter(request, response);
    }
}
