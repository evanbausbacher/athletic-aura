import { IScoreCategory } from "./score-category.model";

export interface IScore{
    name : string;
    profile_url : string;
    scores : IScoreCategory[];
    overallScore : number;
    overallGrade : string; 
    overallRating : string;
}