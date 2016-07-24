//RD_Moogle_X_EquipSkillSystem_Options.js
//16_0724
//v1.0
//Last: 16_0724

var RD = RD || {};
RD.MoogleX_EQS_Ops = RD.MoogleX_EQS_Ops || {};
var Imported = Imported || {};
Imported.RD_MoogleX_EQS_Ops = true;

/*

  ToDo:
  - Note tag to exempt a skill from SType Requirements.


 Instructions:
 - Place this plugin directly underneath Moogle_X_EquipSkillSystem plugin. 
 - An Eval override for eqsIsLearnedSkill (bool)


*/

/*:
 * @plugindesc v1.0 (Requires Moogle_X_EquipSkillSystem)
 * @author RogueDeus
 * 
 * @param Include Trait Skills
 * @desc Will include skills gained through trait objects (like Equips & States) in Equip Pool. Still supports <EQS Ignore> 
 * @default true
 * 
 * @param Enforce Skill Type Req
 * @desc Disables equip skills when actor does not meet Skill Type access requirements.
 * @default true


Credits: 
  Moogle_X for the great Skills Equip Plugin!



*/

(function($) {
//==============================================================================

  $.Parameters = PluginManager.parameters('RD_Moogle_X_EquipSkillSystem_Options');
  $.IncludeTraitSkills = eval($.Parameters['Include Trait Skills']);
  $.EnforceSTypeReq = eval($.Parameters['Enforce Skill Type Req']);

//==============================================================================
//Adding Skill Type Required filter to skill pool.
//Adding 'trait' gained skills to skill pool.
//Both, unless skill is listed as always available. <EQS Ignore>


//Overwrite 
//(I see why Moogle wants this plugin above all his other scripts...)
Game_Actor.prototype.skills = function() {
  var list = this.getEqsArray();
  list = list.filter(function(id) {
    return id !== 0;
  });

  if(!$.IncludeTraitSkills){
    list = list.concat(this.addedSkills());
  }

  var list2 = [];
  list.forEach(function(id) {
    if (!list2.contains($dataSkills[id])) { //Required to prevent duplicate pushes.
      list2.push($dataSkills[id]);
    }
  });

  this._skills.concat(this.addedSkills()).forEach(function(id) {
    if (!list2.contains($dataSkills[id]) && $dataSkills[id].isEqsIgnore) {
      list2.push($dataSkills[id]);
    }
  });
  return list2;
};


//Overwrite
Game_Actor.prototype.getSkillPool = function(typeId) {
  var array = this._skills;

  if($.IncludeTraitSkills){
    array = this._skills.concat(this.addedSkills());
  }

  array = array.map(function(skillId) {
      return $dataSkills[skillId];
  });

  // Slot Type check addition.
  array = array.filter(function(skill) {
      return skill.eqsType === typeId;
  });

  array = array.filter(function(skill) {
      return skill.isEqsIgnore === false;
  });

  if (Moogle_X.EQS.classRestrict) {
      var legalSkills = this.eqsGetLegalSkills();
      array = array.filter(function(skill) {
          return legalSkills.contains(skill.id);
      });
  }

  return array;
};


//Overwrite
Game_Actor.prototype.eqsIsLearnedSkill = function(skillId) {
  // Party based skill pool.
  if (Moogle_X.EQS.partySkillPool) {
    var list = [];
    for (var i = 0; i < $gameParty.allMembers().length; i++) {
      var skillPool = $gameParty.allMembers()[i]._skills;
      list = list.concat(skillPool);
    }
    return list.contains(skillId);

  } else if ($.EnforceSTypeReq) {
    //Included check for skill type availability...
    if(this._skills.concat(this.addedSkills()).contains(skillId)) {
      return this.addedSkillTypes().contains($dataSkills[skillId].stypeId);
    }

  } else {
    return this._skills.contains(skillId);
  }
};



//==============================================================================
})(RD.MoogleX_EQS_Ops);






