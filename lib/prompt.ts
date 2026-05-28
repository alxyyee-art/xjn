import type { RecommendRequest, Recommendation } from './types';
import { MEAL_OPTIONS, TASTE_OPTIONS, BUDGET_OPTIONS, CUISINE_OPTIONS, CHINESE_CUISINE_OPTIONS, DIETARY_OPTIONS, STYLE_LABELS } from './types';

function describeMeal(meal: string): string {
  return MEAL_OPTIONS.find((m) => m.value === meal)?.label ?? meal;
}

function describeOptions(opts: { value: string; label: string }[], selected: string[]): string {
  if (selected.length === 0) return '无特殊要求';
  return selected
    .map((s) => opts.find((o) => o.value === s)?.label ?? s)
    .join(' + ');
}

export function buildRecommendPrompt(req: RecommendRequest): string {
  const mealLabel = describeMeal(req.meal);
  const tasteDesc = describeOptions(TASTE_OPTIONS, req.tastes);
  const budgetDesc = describeOptions(BUDGET_OPTIONS, req.budgets);
  const cuisineDesc = describeOptions(CUISINE_OPTIONS, req.cuisines);
  const chineseCuisineDesc = req.chineseCuisines.length > 0
    ? `（${describeOptions(CHINESE_CUISINE_OPTIONS, req.chineseCuisines)}）` : '';
  const dietaryDesc = describeOptions(DIETARY_OPTIONS, req.dietary);

  if (req.rethinkStyle) {
    const styleLabel = STYLE_LABELS[req.rethinkStyle];
    return `你是一位资深美食推荐师。用户对之前的「${styleLabel.emoji} ${styleLabel.label}」推荐不满意，请重新推荐一道完全不同的组合餐。

偏好：
- 餐段：${mealLabel}
- 口味：${tasteDesc}
- 价位：${budgetDesc}
- 菜系：${cuisineDesc}${chineseCuisineDesc}
${req.dietary.length > 0 ? `- 忌口：${dietaryDesc}` : ''}
${req.custom ? `- 额外要求：${req.custom}` : ''}

要求：
1. 只生成 1 条「${styleLabel.label}」风格的推荐
2. 必须是**组合餐**（一套搭配完整的餐食），而非单一菜品
3. 推荐要具体、接地气、符合中国用户的饮食习惯认知
4. 必须和之前推荐的内容完全不同

请严格按以下 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "recommendations": [
    {
      "style": "${req.rethinkStyle}",
      "name": "组合餐名称",
      "reason": "推荐理由（2-3句话，说明为什么搭配合理）",
      "rating": 4.5,
      "comment": "一句话简评（有趣、接地气）"
    }
  ]
}

rating 为 1.0-5.0 之间的数字，保留一位小数`;
  }

  return `你是一位资深美食推荐师，用户需要推荐一顿"${mealLabel}"。

偏好：
- 口味：${tasteDesc}
- 价位：${budgetDesc}
- 菜系：${cuisineDesc}${chineseCuisineDesc}
${req.dietary.length > 0 ? `- 忌口：${dietaryDesc}` : ''}
${req.custom ? `- 额外要求：${req.custom}` : ''}

要求：
1. 生成 5 条推荐，每条对应一种风格——「经典稳妥」「大胆尝鲜」「健康轻食」「碳水快乐」「惊喜盲盒」
2. 每条推荐必须是**组合餐**（一套搭配完整的餐食，如主菜+配菜+饮品/甜点），而非单一菜品
3. 如果用户选了多种口味（如甜+咸），要包含甜咸搭配的菜品组合
4. 推荐要具体、接地气、符合中国用户的饮食习惯认知

请严格按以下 JSON 格式返回（不要包含 markdown 代码块标记）：
{
  "recommendations": [
    {
      "style": "classic",
      "name": "组合餐名称",
      "reason": "推荐理由（2-3句话，说明为什么搭配合理）",
      "rating": 4.5,
      "comment": "一句话简评（有趣、接地气）"
    }
  ]
}

style 必须是以下之一：classic, adventurous, healthy, comfort, wildcard
rating 为 1.0-5.0 之间的数字，保留一位小数`;
}
