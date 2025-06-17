{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 9,
			"minor" : 1,
			"revision" : 0,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ 34.0, 100.0, 784.0, 724.0 ],
		"openrect" : [ 0.0, 0.0, 783.6875, 723.9765625 ],
		"gridsize" : [ 15.0, 15.0 ],
		"showrootpatcherontab" : 0,
		"showontab" : 0,
		"integercoordinates" : 1,
		"boxes" : [ 			{
				"box" : 				{
					"fontname" : "Arial",
					"fontsize" : 12.0,
					"id" : "obj-6",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 0,
					"patcher" : 					{
						"fileversion" : 1,
						"appversion" : 						{
							"major" : 9,
							"minor" : 1,
							"revision" : 0,
							"architecture" : "x64",
							"modernui" : 1
						}
,
						"classnamespace" : "box",
						"rect" : [ 0.0, 26.0, 784.0, 698.0 ],
						"gridsize" : [ 15.0, 15.0 ],
						"showontab" : 1,
						"integercoordinates" : 1,
						"boxes" : [  ],
						"lines" : [  ]
					}
,
					"patching_rect" : [ 81.0, 113.0, 50.0, 22.0 ],
					"text" : "p ?",
					"varname" : "q_tab"
				}

			}
, 			{
				"box" : 				{
					"border" : 0,
					"filename" : "helpname.js",
					"id" : "obj-5",
					"ignoreclick" : 1,
					"jsarguments" : [ "pdmq.keyboard" ],
					"maxclass" : "jsui",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 10.0, 10.0, 331.592010498046875, 57.599853515625 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-12",
					"maxclass" : "newobj",
					"numinlets" : 0,
					"numoutlets" : 0,
					"patcher" : 					{
						"fileversion" : 1,
						"appversion" : 						{
							"major" : 9,
							"minor" : 1,
							"revision" : 0,
							"architecture" : "x64",
							"modernui" : 1
						}
,
						"classnamespace" : "box",
						"rect" : [ 34.0, 126.0, 784.0, 698.0 ],
						"openrect" : [ 0.0, 0.0, 830.140625, 739.0234375 ],
						"gridsize" : [ 15.0, 15.0 ],
						"showontab" : 1,
						"integercoordinates" : 1,
						"boxes" : [ 							{
								"box" : 								{
									"id" : "obj-18",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 118.0, 587.0, 80.0, 22.0 ],
									"text" : "write 1 5"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-14",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 2,
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 389.0, 236.0, 73.0, 22.0 ],
									"text" : "route queue"
								}

							}
, 							{
								"box" : 								{
									"code" : "1, 0;\r2, 0;\r3, 0;\r4, 0;\r5, 0;\r6, 0;\r7, 0;\r8, 0;\r",
									"fontface" : 0,
									"fontname" : "<Monospaced>",
									"fontsize" : 12.0,
									"id" : "obj-9",
									"maxclass" : "coll.codebox",
									"numinlets" : 1,
									"numoutlets" : 4,
									"outlettype" : [ "", "", "", "" ],
									"patching_rect" : [ 389.0, 289.0, 298.0, 354.0 ],
									"saved_object_attributes" : 									{
										"precision" : 6
									}

								}

							}
, 							{
								"box" : 								{
									"id" : "obj-8",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 50.0, 615.0, 59.0, 22.0 ],
									"text" : "getqueue"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-1",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 2,
									"outlettype" : [ "bang", "" ],
									"patching_rect" : [ 50.0, 587.0, 30.0, 22.0 ],
									"text" : "t b l"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-4",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 137.0, 280.0, 67.0, 22.0 ],
									"text" : "get filepath"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-25",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 50.0, 280.0, 80.0, 22.0 ],
									"text" : "prepend read"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-23",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "bang" ],
									"patching_rect" : [ 50.0, 202.0, 58.0, 22.0 ],
									"text" : "loadbang"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-21",
									"maxclass" : "newobj",
									"numinlets" : 2,
									"numoutlets" : 2,
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 268.0, 621.0, 78.0, 22.0 ],
									"text" : "route filepath"
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-20",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 50.0, 236.0, 239.0, 22.0 ],
									"text" : "pdmq.keyboard.help.kb-mapping.txt"
								}

							}
, 							{
								"box" : 								{
									"args" : [ "@usefullpath", 0 ],
									"bgmode" : 0,
									"border" : 0,
									"clickthrough" : 0,
									"enablehscroll" : 0,
									"enablevscroll" : 0,
									"id" : "obj-11",
									"lockeddragscroll" : 0,
									"lockedsize" : 0,
									"maxclass" : "bpatcher",
									"name" : "pdmq.keyboard.maxpat",
									"numinlets" : 1,
									"numoutlets" : 2,
									"offset" : [ 0.0, 0.0 ],
									"outlettype" : [ "", "" ],
									"patching_rect" : [ 50.0, 312.0, 237.0, 261.0 ],
									"viewvisibility" : 1
								}

							}
, 							{
								"box" : 								{
									"id" : "obj-2",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 61.0, 649.0, 207.0, 22.0 ],
									"text" : "pdmq live_2025-06-10_queues 8 256"
								}

							}
, 							{
								"box" : 								{
									"border" : 0,
									"filename" : "helpdetails.js",
									"id" : "obj-3",
									"ignoreclick" : 1,
									"jsarguments" : [ "pdmq.keyboard" ],
									"maxclass" : "jsui",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"parameter_enable" : 0,
									"patching_rect" : [ 10.0, 10.0, 688.0, 179.0 ]
								}

							}
 ],
						"lines" : [ 							{
								"patchline" : 								{
									"destination" : [ "obj-2", 0 ],
									"source" : [ "obj-1", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-8", 0 ],
									"source" : [ "obj-1", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-1", 0 ],
									"order" : 1,
									"source" : [ "obj-11", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-18", 1 ],
									"order" : 0,
									"source" : [ "obj-11", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-21", 0 ],
									"source" : [ "obj-11", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-9", 0 ],
									"source" : [ "obj-14", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-14", 0 ],
									"midpoints" : [ 70.5, 677.0, 702.17578125, 677.0, 702.17578125, 215.0, 398.5, 215.0 ],
									"source" : [ "obj-2", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-25", 0 ],
									"source" : [ "obj-20", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-20", 1 ],
									"midpoints" : [ 277.5, 653.0, 364.016161048784852, 653.0, 364.016161048784852, 225.860011303797364, 279.5, 225.860011303797364 ],
									"source" : [ "obj-21", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-20", 0 ],
									"source" : [ "obj-23", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-11", 0 ],
									"source" : [ "obj-25", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-11", 0 ],
									"source" : [ "obj-4", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-2", 0 ],
									"source" : [ "obj-8", 0 ]
								}

							}
 ]
					}
,
					"patching_rect" : [ 56.0, 83.0, 47.0, 22.0 ],
					"text" : "p basic"
				}

			}
 ],
		"lines" : [  ],
		"parameters" : 		{
			"obj-12::obj-11::obj-10::obj-15" : [ "live.text", "live.text", 0 ],
			"obj-12::obj-11::obj-10::obj-18" : [ "live.text[1]", "live.text", 0 ],
			"obj-12::obj-11::obj-10::obj-19" : [ "live.text[2]", "live.text", 0 ],
			"obj-12::obj-11::obj-26" : [ "kb_ctrl_enabled", "kb_ctrl_enabled", 0 ],
			"obj-12::obj-11::obj-29" : [ "live.text[3]", "live.text[3]", 0 ],
			"parameterbanks" : 			{
				"0" : 				{
					"index" : 0,
					"name" : "",
					"parameters" : [ "-", "-", "-", "-", "-", "-", "-", "-" ]
				}

			}
,
			"inherited_shortname" : 1
		}
,
		"dependency_cache" : [ 			{
				"name" : "helpdetails.js",
				"bootpath" : "C74:/help/resources",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "helpname.js",
				"bootpath" : "C74:/help/resources",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "pdm.abstract.filetypes.maxpat",
				"bootpath" : "~/Documents/Max 9/Packages/pdm.abstract/patchers",
				"patcherrelativepath" : "../../pdm.abstract/patchers",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "pdm.abstract.patcherargs.js",
				"bootpath" : "~/Documents/Max 9/Packages/pdm.abstract/javascript",
				"patcherrelativepath" : "../../pdm.abstract/javascript",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "pdm.abstract.readwrite.js",
				"bootpath" : "~/Documents/Max 9/Packages/pdm.abstract/javascript",
				"patcherrelativepath" : "../../pdm.abstract/javascript",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "pdm.abstract.readwrite.maxpat",
				"bootpath" : "~/Documents/Max 9/Packages/pdm.abstract/patchers",
				"patcherrelativepath" : "../../pdm.abstract/patchers",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "pdmq.host.js",
				"bootpath" : "~/Documents/Max 9/Packages/pdmq/javascript",
				"patcherrelativepath" : "../javascript",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "pdmq.init.maxpat",
				"bootpath" : "~/Documents/Max 9/Packages/pdmq/patchers",
				"patcherrelativepath" : "../patchers",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "pdmq.js",
				"bootpath" : "~/Documents/Max 9/Packages/pdmq/javascript",
				"patcherrelativepath" : "../javascript",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "pdmq.kbviz.key.maxpat",
				"bootpath" : "~/Documents/Max 9/Packages/pdmq/extras",
				"patcherrelativepath" : "../extras",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "pdmq.kbviz.maxpat",
				"bootpath" : "~/Documents/Max 9/Packages/pdmq/extras",
				"patcherrelativepath" : "../extras",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "pdmq.keyboard.help.kb-mapping.txt",
				"bootpath" : "~/Documents/Max 9/Packages/pdmq/misc",
				"patcherrelativepath" : "../misc",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "pdmq.keyboard.maxpat",
				"bootpath" : "~/Documents/Max 9/Packages/pdmq/patchers",
				"patcherrelativepath" : "../patchers",
				"type" : "JSON",
				"implicit" : 1
			}
, 			{
				"name" : "pdmq.maxjsobject.js",
				"bootpath" : "~/Documents/Max 9/Packages/pdmq/javascript",
				"patcherrelativepath" : "../javascript",
				"type" : "TEXT",
				"implicit" : 1
			}
, 			{
				"name" : "pdmq.maxpat",
				"bootpath" : "~/Documents/Max 9/Packages/pdmq/patchers",
				"patcherrelativepath" : "../patchers",
				"type" : "JSON",
				"implicit" : 1
			}
 ],
		"autosave" : 0
	}

}
