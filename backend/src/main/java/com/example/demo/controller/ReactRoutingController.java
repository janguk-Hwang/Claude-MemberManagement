package com.example.demo.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** SPA 새로고침 대응: React 라우트를 index.html로 포워딩 */
@Controller
public class ReactRoutingController {
    @GetMapping({"/", "/login", "/signup"})
    public String forward() {
        return "forward:/index.html";
    }
}
