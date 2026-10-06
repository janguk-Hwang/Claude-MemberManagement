package com.example.demo.service;

import com.example.demo.dto.Dtos.*;
import com.example.demo.entity.Member;
import com.example.demo.entity.Role;
import com.example.demo.repository.MemberRepository;
import com.example.demo.security.JwtTokenProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public MemberService(MemberRepository memberRepository, PasswordEncoder passwordEncoder,
                         JwtTokenProvider jwtTokenProvider) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public Member signup(SignupRequest req) {
        if (req.name() == null || req.name().isBlank() || req.password() == null
                || req.password().isBlank() || req.phone() == null || req.phone().isBlank()) {
            throw new IllegalArgumentException("아이디, 비밀번호, 전화번호는 필수입니다.");
        }
        if (memberRepository.existsByName(req.name())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        Member m = new Member();
        m.setName(req.name().trim());
        m.setPassword(passwordEncoder.encode(req.password()));
        m.setAddress(req.address());
        m.setBirthDate(req.birthDate());
        m.setPhone(req.phone());
        m.setRole("ADMIN".equalsIgnoreCase(req.role()) ? Role.ADMIN : Role.USER);
        return memberRepository.save(m);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        Member m = memberRepository.findByName(req.name())
                .filter(x -> passwordEncoder.matches(req.password(), x.getPassword()))
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));
        String token = jwtTokenProvider.createToken(m.getName(), m.getRole().name());
        m.setCurrentToken(token); // 이전 기기의 토큰은 무효화됨
        return new AuthResponse(token, m.getId(), m.getName(), m.getRole().name());
    }

    @Transactional
    public void logout(Long memberId) {
        memberRepository.findById(memberId).ifPresent(m -> m.setCurrentToken(null));
    }

    public boolean isNameAvailable(String name) {
        return name != null && !name.isBlank() && !memberRepository.existsByName(name.trim());
    }

    public Page<Member> search(String name, Pageable pageable) {
        if (name == null || name.isBlank()) return memberRepository.findAll(pageable);
        return memberRepository.findByNameContainingIgnoreCase(name.trim(), pageable);
    }

    public java.util.List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public Member get(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("회원을 찾을 수 없습니다."));
    }

    @Transactional
    public Member update(Long id, UpdateRequest req) {
        Member m = get(id);
        if (req.name() != null && !req.name().isBlank() && !req.name().equals(m.getName())) {
            if (memberRepository.existsByName(req.name())) {
                throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
            }
            m.setName(req.name().trim());
        }
        m.setAddress(req.address());
        m.setBirthDate(req.birthDate());
        if (req.phone() != null && !req.phone().isBlank()) m.setPhone(req.phone());
        return m;
    }

    @Transactional
    public void delete(Long id) {
        memberRepository.deleteById(id);
    }

    public static MemberResponse toResponse(Member m) {
        return new MemberResponse(m.getId(), m.getName(), m.getAddress(), m.getBirthDate(),
                m.getPhone(), m.getRole().name());
    }
}
