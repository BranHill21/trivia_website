package com.example.demo.helpers;

import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/*
 * Class for holding and interacting with questions pulled from API or created manually.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class Question {
	protected String question;
	protected String category;
	protected String type;
	protected String difficulty;
	protected String correctAnswer;
	protected ArrayList<String> incorrectAnswers;
	
	public Question () {}
	
	public Question (String newQuestion, String newCategory, String newType, String newDifficulty, String newCorrectAnswer, ArrayList<String> newIncorrectAnswers) {
		question = newQuestion;
		category = newCategory;
		type = newType;
		difficulty = newDifficulty;
		correctAnswer = newCorrectAnswer;
		incorrectAnswers = newIncorrectAnswers;
	}
	
	public String toString() {
		String output = "";
		
		if (question != null)
			output += "Question: " + question + "\n";
		
		if (category != null)
			output += "Category: " + category + "\n";
		
		if (type != null)
			output += "Type: " + type + "\n";
		
		if (difficulty != null)
			output += "Difficulty: " + difficulty + "\n";
		
		if (correctAnswer != null)
			output += "Correct Answer: " + correctAnswer + "\n";
		
		if (incorrectAnswers != null)
			for (String answer : incorrectAnswers) {
				output += "Incorrect Answer: " + answer + "\n";
			}
		
		
		
		return output;
	}
	
	/*
	 * Getters and Setters
	 */
	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getDifficulty() {
		return difficulty;
	}

	public void setDifficulty(String difficulty) {
		this.difficulty = difficulty;
	}

	public String getCorrectAnswer() {
		return correctAnswer;
	}

	public void setCorrectAnswer(String correctAnswer) {
		this.correctAnswer = correctAnswer;
	}

	public ArrayList<String> getIncorrectAnswers() {
		return incorrectAnswers;
	}

	public void setIncorrectAnswers(ArrayList<String> incorrectAnswers) {
		this.incorrectAnswers = incorrectAnswers;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}
	
	
}
