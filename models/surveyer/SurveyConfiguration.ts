import { Survey } from "@/models/surveyer/Survey";
import { SurveyModel } from "survey-core";

export class SurveyConfiguration {
  survey = new Survey();
  surveyModel = new SurveyModel();
}
