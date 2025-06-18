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
	
	@GetMapping("/about")
	public String getAbout()
	{
		return "about";
	}
	
	@GetMapping("/privacy")
	public String getPrivacy()
	{
		return "privacy";
	}
	
	@GetMapping("/terms")
	public String getTerms()
	{
		return "terms";
	}
	
	@GetMapping("/contact")
	public String getContact()
	{
		return "contact";
	}
}
