{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 9,
			"minor" : 0,
			"revision" : 7,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ 186.0, 100.0, 526.0, 848.0 ],
		"gridsize" : [ 15.0, 15.0 ],
		"integercoordinates" : 1,
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-6",
					"linecount" : 3,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 435.0, 245.0, 76.0, 47.0 ],
					"text" : "init begins ( parent loadbang)"
				}

			}
, 			{
				"box" : 				{
					"comment" : "init begins",
					"id" : "obj-5",
					"index" : 5,
					"maxclass" : "outlet",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 435.0, 206.0, 30.0, 30.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-21",
					"linecount" : 2,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 354.0, 245.0, 68.0, 33.0 ],
					"text" : "attribute arguments"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-20",
					"linecount" : 2,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 239.0, 245.0, 76.0, 33.0 ],
					"text" : "normal arguments"
				}

			}
, 			{
				"box" : 				{
					"comment" : "attribute arguments",
					"id" : "obj-18",
					"index" : 4,
					"maxclass" : "outlet",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 354.0, 206.0, 30.0, 30.0 ]
				}

			}
, 			{
				"box" : 				{
					"comment" : "normal arguments",
					"id" : "obj-16",
					"index" : 3,
					"maxclass" : "outlet",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 239.0, 206.0, 30.0, 30.0 ]
				}

			}
, 			{
				"box" : 				{
					"filename" : "none",
					"id" : "obj-14",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 239.0, 105.0, 134.0, 22.0 ],
					"saved_object_attributes" : 					{
						"parameter_enable" : 0
					}
,
					"text" : "v8 @embed 1 @level 1",
					"textfile" : 					{
						"text" : "// pdm.abstract.patcherargs.js\n// get patcher arguments from a patcher in a patcher hierarchy\n// philip meyer 2025 / philip@inter-modal.com\n\noutlets = 2;\n\n//internal variables\n//patcher to be assigned when `level` is set\nlet p = null;\nconst self = this;\n\n//hierarchy of patchers\nconst hierarchy = getPatcherHierarchy();\n\n//whether we're at the top level of the hierarchy (if we are, we don't need to output the arguments)\nlet isTopLevel = false;\n\n//attributes\n\n//level of the patcher. 0 = this patcher, 1 = parent, 2 = grandparent, etc.\nvar level = 0;\ndeclareattribute(\"level\", {\n\ttype: \"long\",\n\tlabel: \"Level\",\n\tstyle: \"number\",\n\tdefault: 0,\n\tmin: 0, \n\tmax: 16,\n\tsetter: \"setLevel\"\n})\n\n//interface\n//only user-facing function is `bang`\n//when `bang` is called, we parse the arguments and output them\nfunction bang() {\n\t//if no patcher or at top level, do nothing\n\tif(!p || isTopLevel) return; \n\t//parse the arguments of the patcher\n\tconst args = parseArgs(p);\n\t//output the arguments in the style of Max's patcherargs object\n\toutputArgs(args);\n}\n\n//get the hierarchy of patchers\nfunction getPatcherHierarchy() {\n\tconst hierarchy = [];\n\tlet patcher = self.patcher;\n\twhile(patcher) {\n\t\thierarchy.push(patcher);\n\t\tpatcher = patcher.parentpatcher;\n\t}\n\treturn hierarchy;\n}\n\n//get the patcher at the given level\nfunction getPatcherAtLevel(level) {\n\treturn hierarchy[level];\n}\ngetPatcherAtLevel.local = 1;\n\n//setter for `level` attribute\nfunction setLevel(l) {\n\t//if we don't have a hierarchy, get it\n\tif(hierarchy.length === 0) {\n\t\thierarchy = getPatcherHierarchy();\n\t}\n\t//set the level to the new level, clamped to the hierarchy\n\tlevel = Math.max(0, Math.min(l, hierarchy.length - 1));\n\t//if we're at the top level, set the patcher to null\n\tisTopLevel = level === hierarchy.length - 1;\n\t//get the patcher at the new level, and assign it to `p`\n\tp = getPatcherAtLevel(level);\n}\nsetLevel.local = 1;\n\n//parse the arguments of the given patcher\nfunction parseArgs(patcher) {\n\t//get the arguments of the patcher\n\tconst pArgs = getPatcherArgs(patcher);\n\t//initialize the arrays for regular and attribute arguments\n\tconst regularArgs = [];\n\tconst attrArgs = [];\n\t//set the target to regular\n\tlet argTarget = 'regular';\n\t\n\t//iterate over the arguments\n\tpArgs.forEach((arg) => {\n\t\t//check if the argument is an attribute name\n\t\tconst isAttrName = arg[0] === \"@\";\n\n\t\t//handle the type of the argument\n\t\tif(!isAttrName) {\n\t\t\targ = parseType(arg);\n\t\t}\n\t\t//when we see our first @ attribute name, switch to the attribute target\n\t\tif(argTarget === 'regular' && isAttrName) {\n\t\t\targTarget = 'attr';\n\t\t}\n\n\t\t//add the argument to the appropriate target\n\t\tif(argTarget === 'regular') {\n\t\t\tregularArgs.push(arg);\n\t\t} else {\n\t\t\t//if this is an attribute name, create a new nested array for the attribute\n\t\t\tif(isAttrName) {\n\t\t\t\targ = arg.slice(1)\n\t\t\t\tattrArgs.push([]);\n\t\t\t}\n\t\t\t//if this is not an attribute name, it's a value. add it to the current attribute array\n\t\t\tattrArgs[attrArgs.length - 1].push(arg);\n\t\t}\t\n\t})\n\n\t//return the arguments\n\treturn {\n\t\tregularArgs: regularArgs,\n\t\tattrArgs: attrArgs\n\t}\n}\nparseArgs.local = 1;\n\n// parse the type of the argument\nfunction parseType(arg) {\n\t//try to parse the argument as an integer and return it if it's an integer\n\tconst asInt = parseInt(arg);\n\tconst asFloat = parseFloat(arg);\n\t\n\tif(asInt === asFloat) {\n\t\treturn asInt;\n\t}\n\tif(!isNaN(asFloat)) {\n\t\treturn asFloat;\n\t} \n\t//if it's not an integer or a float, return the argument as is\n\treturn arg;\n}\nparseType.local = 1;\n\n//get the arguments of the given patcher\nfunction getPatcherArgs(patcher) {\n\t//ignore the first argument, which is the patcher name\n\treturn patcher.box.boxtext.split(\" \").slice(1);\n}\ngetPatcherArgs.local = 1;\n\n//output the arguments in the style of Max's patcherargs object\nfunction outputArgs(args) {\n\t//output the attribute arguments one-by-one(2nd outlet)\n\targs.attrArgs.forEach((argArr) => {\n\t\toutlet(1, argArr)\n\t});\n\t//when attribute arguments are done, output 'done'\n\toutlet(1, 'done');\n\t//output the regular arguments (1st outlet)\n\toutlet(0, args.regularArgs);\n}\noutputArgs.local = 1;",
						"filename" : "none",
						"flags" : 1,
						"embed" : 1,
						"autowatch" : 1
					}

				}

			}
, 			{
				"box" : 				{
					"comment" : "local loadbang",
					"id" : "obj-3",
					"index" : 2,
					"maxclass" : "outlet",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 156.0, 206.0, 30.0, 30.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-27",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 156.0, 245.0, 62.0, 20.0 ],
					"text" : "args done"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-26",
					"linecount" : 5,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 43.0, 245.0, 109.0, 74.0 ],
					"text" : "\"global\" \nloadbang\n(patcher hierarchy has completed initialization)"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-24",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 43.0, 168.0, 22.0, 22.0 ],
					"text" : "t b"
				}

			}
, 			{
				"box" : 				{
					"comment" : "global loadbang",
					"id" : "obj-2",
					"index" : 1,
					"maxclass" : "outlet",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 43.0, 206.0, 30.0, 30.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-1",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 4,
					"outlettype" : [ "int", "float", "int", "int" ],
					"patching_rect" : [ 43.0, 132.0, 61.0, 22.0 ],
					"text" : "dspstate~"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-4",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "bang", "bang", "bang" ],
					"patching_rect" : [ 43.0, 77.0, 411.0, 22.0 ],
					"text" : "t b b b"
				}

			}
, 			{
				"box" : 				{
					"comment" : "connect loadbang",
					"id" : "obj-10",
					"index" : 1,
					"maxclass" : "inlet",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "bang" ],
					"patching_rect" : [ 43.0, 40.0, 30.0, 30.0 ]
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-24", 0 ],
					"source" : [ "obj-1", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-4", 0 ],
					"source" : [ "obj-10", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-16", 0 ],
					"source" : [ "obj-14", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-18", 0 ],
					"source" : [ "obj-14", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-24", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-1", 0 ],
					"order" : 1,
					"source" : [ "obj-4", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-14", 0 ],
					"source" : [ "obj-4", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-3", 0 ],
					"order" : 0,
					"source" : [ "obj-4", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-5", 0 ],
					"source" : [ "obj-4", 2 ]
				}

			}
 ]
	}

}
