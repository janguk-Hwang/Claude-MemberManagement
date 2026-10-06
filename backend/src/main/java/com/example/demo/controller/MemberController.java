package com.example.demo.controller;

import com.example.demo.dto.Dtos.*;
import com.example.demo.entity.Member;
import com.example.demo.entity.Role;
import com.example.demo.security.CustomUserDetails;
import com.example.demo.service.MemberService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
public class MemberController {
    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    private Member me(Authentication a) {
        return ((CustomUserDetails) a.getPrincipal()).getMember();
    }

    private boolean isAdmin(Authentication a) {
        return me(a).getRole() == Role.ADMIN;
    }

    @GetMapping
    public ResponseEntity<?> getMembers(@RequestParam(required = false) String name,
                                        Pageable pageable, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (isAdmin(authentication)) {
            Page<MemberResponse> page = memberService.search(name, pageable).map(MemberService::toResponse);
            return ResponseEntity.ok(page);
        }
        // 일반 사용자: 본인 정보만
        Member self = memberService.get(me(authentication).getId());
        return ResponseEntity.ok(new PageImpl<>(List.of(MemberService.toResponse(self)), pageable, 1));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UpdateRequest req,
                                    Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!isAdmin(authentication) && !me(authentication).getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "권한이 없습니다."));
        }
        try {
            return ResponseEntity.ok(MemberService.toResponse(memberService.update(id, req)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "관리자만 삭제할 수 있습니다."));
        }
        if (me(authentication).getId().equals(id)) {
            return ResponseEntity.badRequest().body(Map.of("message", "본인 계정은 삭제할 수 없습니다."));
        }
        memberService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
