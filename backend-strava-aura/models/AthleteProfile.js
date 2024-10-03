class AthleteProfile{
    constructor(data){
        this.id = data.id;
        this.resource_state = data.resource_state;
        this.firstname = data.firstname;
        this.lastname = data.lastname;
        this.bio = data.bio;
        this.city = data.city;
        this.state = data.state;
        this.country = data.country;
        this.sex - data.sex;
        this.premium = data.premium;
        this.summit = data.summit;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
        this.badge_type_id = data.badge_type_id;
        this.weight = data.weight;
        this.profile_medium = data.profile_medium;
        this.profile = data.profile;
    }
}

module.exports = AthleteProfile;