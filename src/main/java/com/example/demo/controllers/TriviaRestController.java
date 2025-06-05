package com.example.demo.controllers;

import com.example.demo.helpers.Question;
import com.example.demo.services.TriviaAPIService;

import org.springframework.context.annotation.Bean;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TriviaRestController {


 private final TriviaAPIService api;

 public TriviaRestController(TriviaAPIService api) {
     this.api = api;
 }

 @GetMapping("/questions")
 public List<Question> getQuestions(
         @RequestParam(defaultValue = "3") int amount,
         @RequestParam(required = false) Integer category,
         @RequestParam(required = false) String difficulty) throws Exception {

     return api.getQuestions(amount, category, difficulty);
 }
}

