/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */
document.onkeypress = function(evt) {
  evt = evt || window.event;
  var charCode = evt.keyCode || evt.which;
  var which_key = String.fromCharCode(charCode);
  if(which_key == 't'){
  triggers.push(which_key)
  time = jsPsych.totalTime()
  temp = time.toString();
  trigger_times.push(temp)
  trigger_times.push('/')
  }
};
function clearTimes(){
	trigger_times = []
	triggers = []
}

		
	
function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID_triggerTimes() {
  jsPsych.data.addDataToLastTrial({exp_id: 'beast_fmri_test', subject_id: subject_id, trigger_times: trigger_times, triggers: triggers})
}

var responseTextCount = 0
var getTextResponse = function(){
	responseTextCount = responseTextCount + 1
	
	if(responseTextCount % 2 == 0){
		return '<div class = centerbox2_1><p class = block-text2>Please press your '+ yes_key[1] + '.</p></div>'
	} else if (responseTextCount % 2 != 0){
		return '<div class = centerbox2_1><p class = block-text2>Please press your '+ no_key[1] + '.</p></div>'
	}
}


var getEndText = function(){
	return '<div class = centerbox><p class = block-text>'+ practice_feedback_text+'</p></div>'
}

var getPracticeFeedback = function() {
	return '<div class = centerbox><p class = block-text>' + practice_feedback_text + '</p></div>'
}



var getText = function() {
	return '<div class = "centerbox2_2"><p class = "block-text2">Your delay is ' +
	delay +
		' trials.</p><p class = block-text2>Please wait for the scanner to start the block</p></div>'
}

var getText3 = function() {
	return '<div class = "centerbox2_3"><p class = "center-block-text">Great job!  Please keep your head still while the machine finishes scanning.</p></div>'
}

var get_gap_time = function() {
  // ref: https://gist.github.com/nicolashery/5885280
  function randomExponential(rate, randomUniform) {
    // http://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates
    rate = rate || 1;

    // Allow to pass a random uniform value or function
    // Default to Math.random()
    var U = randomUniform;
    if (typeof randomUniform === 'function') U = randomUniform();
    if (!U) U = Math.random();

    return -Math.log(U) / rate;
  }
  gap = randomExponential(1)*1000
  if (gap > 5000) {
    gap = 5000
  }
  return gap 
}

var getSSTime = function(){
	if(adaptive_type == 'target'){
		SSD_target_time = 2750 - SSD_target
		return SSD_target_time
	}else if (adaptive_type == 'non-target'){
		SSD_non_target_time = 2750 - SSD_non_target
		return SSD_non_target_time
	}
}

var update_delay = function() {
	if (delay >= 2) {
		if (mistakes < 3) {
			delay += 1
		} else if (mistakes > 5) {
			delay -= 1
		}
	} else if (delay == 1) {
		if (mistakes < 3) {
			delay += 1
		}
	}
	mistakes = 0
	block_acc = 0
	current_trial = 0
	delayStimCount = 0
};


var createTrialTypes = function(numTrials,delay){
	numIterations = numTrials/9
	trial_types = []
	for(var i =0; i < numIterations; i++){
		for(var a = 0; a < stopTrials.length; a++){
			for(var b = 0; b < adaptiveTrials.length; b++){
				trial_type = {'stop_type': stopTrials[a],
							  'adaptive_type': adaptiveTrials[b]
							  }
				trial_types.push(trial_type)
				}
			}	
		}
	trial_types = jsPsych.randomization.repeat(trial_types,1,true)

	stop_delay = []
	adaptive_delay = []

	for (var x = 0; x < delay; x++){
		index = Math.round(Math.random()*2)	
		stop_delay.push(stopTrials[index])
		adaptive_delay.push('temp-non-target')
	}

	trial_types.stop_type = stop_delay.concat(trial_types.stop_type)	
	trial_types.adaptive_type = adaptive_delay.concat(trial_types.adaptive_type)	

	return trial_types
}


	

var getStim = function(){
	stop_type = trial_types.stop_type.shift()
	adaptive_type = trial_types.adaptive_type.shift()
	
	currentTrial = jsPsych.progress().current_trial_global
	delayed_trial = currentTrial - delay*2
	
	if (adaptive_type == 'temp-non-target'){
	stim = randomDraw(letters)
	} else if (adaptive_type == 'target'){
	stim = jsPsych.data.getDataByTrialIndex(delayed_trial).stim
	} else if (adaptive_type == 'non-target'){
	temp_stim = jsPsych.data.getDataByTrialIndex(delayed_trial).stim
	possible_stims = letters.filter(function(y) { //[P,V,T]
				return (jQuery.inArray(y, temp_stim) == -1)
				})
	stim = randomDraw(possible_stims)
	}

	return preFileType + pathSource + stim + fileType + postFileType

}


var getSSstim = function(){
	return preFileType + pathSource +'red'+ stim + fileType + postFileType
}

var getSSD = function(){
	if(adaptive_type == 'target'){
	return SSD_target
	}else if (adaptive_type == 'non-target'){
	return SSD_non_target
	}
}

var getSSTrialType = function(){
	return stop_type
}

var randomDraw = function(lst) {
	var index = Math.floor(Math.random() * (lst.length))
	return lst[index]
};

						


var appendData = function() {
	jsPsych.data.addDataToLastTrial({
		trial_id: "stim",
		load: delay,
		trial_num: current_trial,
		stop_trial_type: stop_type,
		adaptive_trial_type: adaptive_type,
		stim: stim,
		yes_response_key: yes_key,
		no_response_key: no_key,
		SSD_target: SSD_target,
		SSD_non_target: SSD_non_target,
		SSTarget: SSD_target_time,
		SSNonTarget: SSD_non_target_time
	});

	
	var curr_trial = jsPsych.progress().current_trial_global
	var delayed_trial = curr_trial - delay*2
	
	
	
	if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == yes_key[0]) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'go') && (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'target')){
		jsPsych.data.addDataToLastTrial({go_acc: 1})
	}else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == no_key[0]) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'go') && (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'non-target')){
		jsPsych.data.addDataToLastTrial({go_acc: 1})
	}else {
		jsPsych.data.addDataToLastTrial({go_acc: 0})
	}
	
	if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'stop')){
		jsPsych.data.addDataToLastTrial({stop_acc: 1})

	} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'stop')){
		jsPsych.data.addDataToLastTrial({stop_acc: 0})

	}
	
	if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && ((jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'non-target' )|| (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'target')) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'go')){
		jsPsych.data.addDataToLastTrial({adaptive_acc: 0})
		mistakes = mistakes + 1
	} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == no_key[0]) && (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'target') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'go')){
		jsPsych.data.addDataToLastTrial({adaptive_acc: 0})
		mistakes = mistakes + 1
	} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == yes_key[0]) && (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'non-target') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'go')){
		jsPsych.data.addDataToLastTrial({adaptive_acc: 0})
		mistakes = mistakes + 1
	} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == yes_key[0]) && (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'target') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'go')){
		jsPsych.data.addDataToLastTrial({adaptive_acc: 1})
	} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == no_key[0]) && (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'non-target') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'go')){
		jsPsych.data.addDataToLastTrial({adaptive_acc: 1})
	}
		
	if((jsPsych.data.getDataByTrialIndex(curr_trial).rt == -1) && (SSD_non_target<1500) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'stop') && (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'non-target')){
		SSD_non_target = SSD_non_target + 50
	} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).rt != -1) && (SSD_non_target>0) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'stop') && (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'non-target')){
		SSD_non_target = SSD_non_target - 50
	}
		
	if((jsPsych.data.getDataByTrialIndex(curr_trial).rt == -1) && (SSD_target<1500) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'stop') && (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'target')){
		SSD_target = SSD_target + 50
	} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).rt != -1) && (SSD_target>0) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_trial_type == 'stop') && (jsPsych.data.getDataByTrialIndex(curr_trial).adaptive_trial_type == 'target')){
		SSD_target = SSD_target - 50
	}

	current_trial += 1
}

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
var subject_id = 162
var delay = 2 //adaptive delay 
var SSD_target = 500  //starting SSD for target trials
var SSD_non_target = 500  //starting SSD for non target trials
var num_blocks = 4 // number of functional rounds, 1 functional rounds = 2 test blocks = ~7 min


//Patrick, lines 278, 279, 280, 281, and 282 contain the variables that you may change



var letters = jsPsych.randomization.repeat(['P','B','V','T','D'],1) //add g
var stopSignals = jsPsych.randomization.repeat(['redP','redB','redV'],1)
var stopTrials = ['go','go','stop']
var adaptiveTrials = ['target','non-target','non-target']

var gap = 0
var numTrials = 45
var trigger_times = []
var triggers = []


//var responses = jsPsych.randomization.repeat([[77,'M key',],[78,'N key']],1)
var responses = [[71,'Index Finger',],[89,'Middle Finger']]
if(subject_id % 2 == 0){
	var yes_key = responses[0]
	var no_key = responses[1]
}else if (subject_id % 2 != 0){
	var no_key = responses[0]
	var yes_key = responses[1]
}

var cont_key = ['Magenta Button',77]
var mistakes = 0
var match_acc_thresh = .70
var stim = ''


var trial_types = []
var SSTime = 0
var SSD_target_time = 0
var SSD_non_target_time = 0
var practice_length = 18
var block_acc = 0 // record block accuracy to determine next blocks delay
var trials_done = 0 // counter used by adaptive_test_node
var current_trial = 0




var postFileType = "'></img>"
var pathSource = '/static/experiments/beast_fmri_test/images/'
var fileType = '.png'
var preFileType = "<img class = center src='"




var allStimuli = ['P','B','V','T','D','redP','redB','redV','redT','redD']
var images = []
for(i=0;i<allStimuli.length;i++){
	images.push(pathSource + allStimuli[i] + '.png')
}
jsPsych.pluginAPI.preloadImages(images);

trial_types = createTrialTypes(numTrials,delay)
/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */


var instruction_page_1 = {
	type: 'poldrack-text',		
	data: {
		trial_id: "instruction_3",
	},
	timing_response: -1,
	text: "<div class = centerbox2><p class = block-text>Please <strong> respond yes by pressing your "+ yes_key[1]+" </strong>if the current letter matches the letter, some number of trials ago.  Otherwise, <strong>respond no by pressing your "+ no_key[1]+".</strong></p></div>",
	cont_key: [cont_key[1]],
	timing_post_trial: 0,
};

var instruction_page_5 = {
	type: 'poldrack-text',
	data: {
		trial_id: "instruction_2",
	},
	timing_response: -1,
	text: "<div class = containerbox_test>"+
		"<div class = centerbox3><p class = block-text>Delay = 2</p></div>"+
		"<div class = letterbox1_test1>"+
		"<div class = letters1_test><input type= 'image' class = 'small_letters' src='/static/experiments/beast_fmri_test/images/1.png'></div>"+
		"</div>"+
		"<div class = letterbox3_test1>"+
		"<div class = letters3_test><input type= 'image' class = 'small_letters' src='/static/experiments/beast_fmri_test/images/V.png'></div>"+
		"</div>"+
		"<div class = letterbox1_test2>"+
		"<div class = letters1_test><input type= 'image' class = 'small_letters' src='/static/experiments/beast_fmri_test/images/2.png'></div>"+
		"</div>"+
		"<div class = letterbox3_test2>"+
		"<div class = letters3_test><input type= 'image' class = 'small_letters' src='/static/experiments/beast_fmri_test/images/redB.png'></div>"+
		"</div>"+
		"<div class = letterbox1_test3>"+
		"<div class = letters1_test><input type= 'image' class = 'small_letters' src='/static/experiments/beast_fmri_test/images/3.png'></div>"+
		"</div>"+
		"<div class = letterbox3_test3>"+
		"<div class = letters3_test><input type= 'image' class = 'small_letters' src='/static/experiments/beast_fmri_test/images/V.png'></div>"+
		"</div>"+
		"<div class = letterbox1_test4>"+
		"<div class = letters1_test><input type= 'image' class = 'small_letters' src='/static/experiments/beast_fmri_test/images/4.png'></div>"+
		"</div>"+
		"<div class = letterbox3_test4>"+
		"<div class = letters3_test><input type= 'image' class = 'small_letters' src='/static/experiments/beast_fmri_test/images/B.png'></div>"+
		"</div>"+
		"</div>",
	cont_key: [cont_key[1]],
	timing_post_trial: 0,
};



var end_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "end",
	},
	timing_response: -1,
	text: '<div class = centerbox2_1><p class = center-block-text>Thanks for completing this task!</p></div>',
	cont_key: [cont_key[1]],
	timing_post_trial: 0,
};

var welcome_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "welcome",
	},
	timing_response: -1,
	text: '<div class = centerbox2_1><p class = center-block-text>Welcome to the task!</p></div>',
	cont_key: [cont_key[1]],
	timing_post_trial: 0,
};



var update_delay_block = {
	type: 'call-function',
	func: update_delay,
	data: {
		trial_id: "update_delay"
	},
	timing_post_trial: 0
}



var fixation_block_test = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox2><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
		exp_stage: "test"
	},
	timing_post_trial: 0,
	timing_stim: 500,
	timing_response: 500
}


var start_adaptive_block_1 = {
	type: 'poldrack-text',
	data: {
		trial_id: "start_test_text"
	},
	text: getText,
	cont_key: [84],
	timing_post_trial: 0,
};

var start_adaptive_block_2 = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "practice-no-stop-feedback"
	},
	choices: [cont_key[1]],
	stimulus: getText,
	timing_post_trial: 0,
	is_html: true,
	timing_stim: 10880,
	timing_response: 10880,
	response_ends_trial: false,
};

var test_response_1_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "practice-no-stop-feedback"
	},
	choices: [yes_key[0],no_key[0]],
	stimulus: getTextResponse,
	timing_post_trial: 0,
	is_html: true,
	timing_stim: -1,
	timing_response: -1,
	response_ends_trial: true,
};


var start_adaptive_block2 = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "practice-no-stop-feedback"
	},
	choices: [cont_key[1]],
	stimulus: getText,
	timing_post_trial: 0,
	is_html: true,
	timing_stim: 15000,
	timing_response: 15000,
	response_ends_trial: false,

};

var start_adaptive_block3 = {
	type: 'poldrack-text',
	data: {
		trial_id: "start_test_text"
	},
	text: getText3,
	cont_key: [cont_key[1]],
	timing_post_trial: 0,
};


var start_test_block = {
	type: 'poldrack-text',
	data: {
		trial_id: "test_intro",
	},
	timing_response: -1,
	text: '<div class = centerbox2_1><p class = block-text2>We will now start the test portion.</p></div>',
	cont_key: [cont_key[1]],
	timing_post_trial: 0,
};



var test_block = {
	type: 'stop-signal',
	stimulus: getStim,
	data: {'exp_stage': 'test'},
	SS_stimulus: getSSstim,
	SS_trial_type: getSSTrialType,
	is_html: true,
	choices: [yes_key[0],no_key[0]],
	timing_stim: 2750, //2750
	timing_response: 2750, //2750
	response_ends_trial: false,
	SSD: getSSD, //getSSD
	timing_SS: getSSTime, //getSSTime
	timing_post_trial: get_gap_time, //get_gap_time
	on_finish: appendData,
};


var test_node = {
	timeline: [fixation_block_test,test_block],
	loop_function: function() {
		trials_done += 1
		if (trials_done == numTrials + delay) { //numTrials + delay
			trials_done = 0
			update_delay()
			trial_types = createTrialTypes(numTrials,delay)
			mistakes = 0
			return false
		} else { 
			return true 
		}
	}
}


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var beast_fmri_test_experiment = []


beast_fmri_test_experiment.push(welcome_block);
beast_fmri_test_experiment.push(instruction_page_1);
//beast_fmri_test_experiment.push(instruction_page_5);

for(var a = 0; a < 2; a++){
	beast_fmri_test_experiment.push(test_response_1_block);
}


beast_fmri_test_experiment.push(start_test_block);
	
//test blocks
for (var b = 0; b < num_blocks; b++) {
	beast_fmri_test_experiment.push(start_adaptive_block_1)
	beast_fmri_test_experiment.push(start_adaptive_block_2)
	beast_fmri_test_experiment.push(test_node)
	beast_fmri_test_experiment.push(start_adaptive_block2)
	beast_fmri_test_experiment.push(test_node)
	beast_fmri_test_experiment.push(start_adaptive_block3)
}

beast_fmri_test_experiment.push(end_block);