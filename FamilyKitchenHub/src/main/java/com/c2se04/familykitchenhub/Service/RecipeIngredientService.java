package com.c2se04.familykitchenhub.Service;

import com.c2se04.familykitchenhub.Exception.ResourceNotFoundException;
import com.c2se04.familykitchenhub.model.Ingredient;
import com.c2se04.familykitchenhub.model.Recipe;
import com.c2se04.familykitchenhub.model.RecipeIngredient;
import com.c2se04.familykitchenhub.Repository.IngredientRepository;
import com.c2se04.familykitchenhub.Repository.RecipeRepository;
import com.c2se04.familykitchenhub.Repository.RecipeIngredientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RecipeIngredientService {

    @Autowired
    private RecipeIngredientRepository recipeIngredientRepository;

    @Autowired
    private RecipeRepository recipeRepository;

    @Autowired
    private IngredientRepository ingredientRepository;

    public List<RecipeIngredient> getIngredientsByRecipeId(Long recipeId) {
        return recipeIngredientRepository.findByRecipeId(recipeId);
    }

    @Transactional
    public RecipeIngredient addIngredient(Long recipeId, RecipeIngredient recipeIngredient) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new ResourceNotFoundException("Recipe not found with id: " + recipeId));

        Ingredient ingredient = ingredientRepository.findById(recipeIngredient.getIngredient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Ingredient not found"));

        recipeIngredient.setRecipe(recipe);
        recipeIngredient.setIngredient(ingredient);
        return recipeIngredientRepository.save(recipeIngredient);
    }

    @Transactional
    public RecipeIngredient updateIngredient(Long ingredientId, RecipeIngredient ingredientDetails) {
        RecipeIngredient recipeIngredient = recipeIngredientRepository.findById(ingredientId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("RecipeIngredient not found with id: " + ingredientId));

        if (ingredientDetails.getQuantity() != null) {
            recipeIngredient.setQuantity(ingredientDetails.getQuantity());
        }
        if (ingredientDetails.getUnit() != null) {
            recipeIngredient.setUnit(ingredientDetails.getUnit());
        }

        return recipeIngredientRepository.save(recipeIngredient);
    }

    @Transactional
    public void deleteIngredient(Long ingredientId) {
        RecipeIngredient recipeIngredient = recipeIngredientRepository.findById(ingredientId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("RecipeIngredient not found with id: " + ingredientId));
        recipeIngredientRepository.delete(recipeIngredient);
    }
}
