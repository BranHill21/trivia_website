package com.example.demo.helpers;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.apache.commons.text.StringEscapeUtils;

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
	protected List<String> incorrectAnswers;
	
	/* ------------- helpers ------------------ */
    private static String de(String s) { return s == null ? null : StringEscapeUtils.unescapeHtml4(s); }
	
	public Question () {}
	
	public Question (String newQuestion, String newCategory, String newType, String newDifficulty, String newCorrectAnswer, List<String> newIncorrectAnswers) {
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
	
	/* ------------- getters ------------------ */
    public String getQuestion()            { return de(question); }
    public String getCategory()            { return de(category); }
    public String getType()                { return de(type); }
    public String getDifficulty()          { return de(difficulty); }
    public String getCorrectAnswer()       { return de(correctAnswer); }
    public List<String> getIncorrectAnswers() {
        return incorrectAnswers == null ? List.of()
               : incorrectAnswers.stream().map(Question::de).toList();
    }

    /* ------------- setters (needed by Jackson)  */
    public void setQuestion(String q)                   { this.question = q; }
    public void setCategory(String c)                   { this.category = c; }
    public void setType(String t)                       { this.type = t; }
    public void setDifficulty(String d)                 { this.difficulty = d; }
    public void setCorrectAnswer(String a)              { this.correctAnswer = a; }
    public void setIncorrectAnswers(List<String> list)  { this.incorrectAnswers = list; }

	
	
}
