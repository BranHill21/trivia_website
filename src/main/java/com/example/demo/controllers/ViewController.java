package com.example.demo.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {
	@GetMapping("/")
	public String getLanding()
	{
		return "landing";
	}
}
