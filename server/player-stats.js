
let levels = [];
let maxLevel = 99;

for(let i = 0; i < maxLevel; i++){
    levels[i] = experienceForLevel(i);
}

console.log(levels);



class PlayerStats {
    constructor(health, skills, defence, attack, callbacks) {
        this.maxHealth = health;
        this.health = health;
        this.experience = {};
        this.defence = defence;
        this.attackSpeed = 600; //temp
        this.attack = attack;
        this.speed = 10;//temp
        this.equipmentStats = {}; //TODO: equipment update into here, damage checks against this
        this.skills = new PlayerSkills(skills, callbacks);
    }
    addExperience(json){
        this.skills.addExperience(json);
    }
}

function experienceToLevel(exp){
    let i  = 0;
    let lastLevelExp = 0;
    let level = 1;
    levels.forEach( levelExp =>{

        if(exp > lastLevelExp && exp < levelExp){
            level = i - 1;
        }
        i++;
        lastLevelExp = levelExp;
    })
    console.log("worked level out as " + level);
    return level;
}


// let power = (level-1)/7;
// let sum = level - 1 + 300 * Math.pow(2, power);
// sum = sum /4;
// return sum


function experienceForLevel( level)
{
    let total = 0;
    for (let i = 1; i < level; i++)
    {
        total += Math.floor(i + 300 * Math.pow(2, i / 7.0));
    }

    return Math.floor(total / 4);
}



class Skill {
    constructor(experience, skillType) {
        this.currentExp = experience;
        this.type = skillType;
    }
    get level(){
        let level = experienceToLevel(this.experience);
        return level
    }
    get experience(){
        return this.currentExp;
    }

    increaseExperience(val){

        let prevLevel = experienceToLevel(this.experience);
        this.currentExp += val;
        let currentLevel = experienceToLevel(this.experience);
        let didLevel = (prevLevel != currentLevel);
        console.log(`prev:${prevLevel}current:${currentLevel}${didLevel}`)
        return didLevel;
    }
}


class PlayerSkills {
    constructor(skills,callbacks) {
        this.skills = {};
        this.callbacks = callbacks;
        let keys = Object.keys(skills)
        keys.forEach(skill=>{
            let exp = skills[skill];
            let newSkill = new Skill(exp, skill);
            this.skills[skill] = newSkill;
        })
    }

    addExperience(json){
        let keys = Object.keys(json);
        keys.forEach(expKey=>{
            let exp = json[expKey] || 0;

            // if(!this.skills.hasOwnProperty(expKey)){
            //     let newSkill = new Skill(exp, skill);
            //     this.skills[skill] = newSkill;
            // }
            let skill = this.skills[expKey]
            let didLevel = skill.increaseExperience(exp);
            if(didLevel){
                let message = {currentExp: skill.currentExp, level:skill.level,  type:skill.type}
                this.callbacks.levelUp(message);
            }
            this.callbacks.gainedEXP(skill);
        })

    }
}

module.exports = {PlayerStats};