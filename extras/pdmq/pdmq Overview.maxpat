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
		"openrect" : [ 50.0, 50.0, 400.0, 300.0 ],
		"gridsize" : [ 15.0, 15.0 ],
		"showrootpatcherontab" : 0,
		"showontab" : 0,
		"integercoordinates" : 1,
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-2",
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
						"rect" : [ 134.0, 198.0, 795.0, 644.0 ],
						"gridsize" : [ 15.0, 15.0 ],
						"showontab" : 1,
						"integercoordinates" : 1,
						"boxes" : [ 							{
								"box" : 								{
									"background" : 1,
									"id" : "obj-5",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 17.0, 70.0, 327.0, 20.0 ],
									"text" : "examples!"
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"id" : "obj-17",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 170.0, 138.0, 178.0, 20.0 ],
									"text" : "read from a queue (events)"
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"id" : "obj-16",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 170.0, 107.0, 213.0, 20.0 ],
									"text" : "create, manage, and write to queues"
								}

							}
, 							{
								"box" : 								{
									"align" : 0,
									"background" : 1,
									"id" : "obj-12",
									"maxclass" : "textbutton",
									"numinlets" : 1,
									"numoutlets" : 3,
									"outlettype" : [ "", "", "int" ],
									"parameter_enable" : 0,
									"patching_rect" : [ 18.0, 136.0, 144.0, 23.0 ],
									"saved_attribute_attributes" : 									{
										"textoncolor" : 										{
											"expression" : "themecolor.theme_selectioncolor"
										}

									}
,
									"text" : "keyboard-control",
									"textjustification" : 0,
									"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"hidden" : 1,
									"id" : "obj-11",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 82.0, 342.0, 51.0, 22.0 ],
									"text" : "pcontrol"
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"hidden" : 1,
									"id" : "obj-10",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 82.0, 291.0, 153.0, 22.0 ],
									"text" : "sprintf pdmq.ex.%s.maxpat"
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"hidden" : 1,
									"id" : "obj-9",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 82.0, 318.0, 48.0, 22.0 ],
									"text" : "load $1"
								}

							}
, 							{
								"box" : 								{
									"align" : 0,
									"background" : 1,
									"id" : "obj-7",
									"maxclass" : "textbutton",
									"numinlets" : 1,
									"numoutlets" : 3,
									"outlettype" : [ "", "", "int" ],
									"parameter_enable" : 0,
									"patching_rect" : [ 17.0, 105.0, 144.0, 23.0 ],
									"saved_attribute_attributes" : 									{
										"textoncolor" : 										{
											"expression" : "themecolor.theme_selectioncolor"
										}

									}
,
									"text" : "algorithmic-sequencing",
									"textjustification" : 0,
									"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"fontname" : "Lato",
									"fontsize" : 36.0,
									"id" : "obj-2",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 17.0, 16.0, 327.0, 50.0 ],
									"text" : "pdmq"
								}

							}
 ],
						"lines" : [ 							{
								"patchline" : 								{
									"destination" : [ "obj-9", 0 ],
									"hidden" : 1,
									"source" : [ "obj-10", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-10", 0 ],
									"hidden" : 1,
									"source" : [ "obj-12", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-10", 0 ],
									"hidden" : 1,
									"source" : [ "obj-7", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-11", 0 ],
									"hidden" : 1,
									"source" : [ "obj-9", 0 ]
								}

							}
 ]
					}
,
					"patching_rect" : [ 56.0, 46.0, 70.0, 22.0 ],
					"text" : "p examples"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-1",
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
						"rect" : [ 0.0, 26.0, 795.0, 644.0 ],
						"gridsize" : [ 15.0, 15.0 ],
						"showontab" : 1,
						"integercoordinates" : 1,
						"boxes" : [ 							{
								"box" : 								{
									"background" : 1,
									"id" : "obj-6",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 170.0, 231.0, 178.0, 20.0 ],
									"text" : "use matrixctrl as a queue UI"
								}

							}
, 							{
								"box" : 								{
									"align" : 0,
									"background" : 1,
									"id" : "obj-4",
									"maxclass" : "textbutton",
									"numinlets" : 1,
									"numoutlets" : 3,
									"outlettype" : [ "", "", "int" ],
									"parameter_enable" : 0,
									"patching_rect" : [ 19.0, 229.0, 144.0, 23.0 ],
									"saved_attribute_attributes" : 									{
										"textoncolor" : 										{
											"expression" : "themecolor.theme_selectioncolor"
										}

									}
,
									"text" : "pdmq.frommtx",
									"textjustification" : 0,
									"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"id" : "obj-3",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 170.0, 200.0, 178.0, 20.0 ],
									"text" : "visualize queues"
								}

							}
, 							{
								"box" : 								{
									"align" : 0,
									"background" : 1,
									"id" : "obj-1",
									"maxclass" : "textbutton",
									"numinlets" : 1,
									"numoutlets" : 3,
									"outlettype" : [ "", "", "int" ],
									"parameter_enable" : 0,
									"patching_rect" : [ 19.0, 198.0, 144.0, 23.0 ],
									"saved_attribute_attributes" : 									{
										"textoncolor" : 										{
											"expression" : "themecolor.theme_selectioncolor"
										}

									}
,
									"text" : "pdmq.view",
									"textjustification" : 0,
									"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"id" : "obj-18",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 170.0, 169.0, 178.0, 20.0 ],
									"text" : "read from a queue (signals)"
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"id" : "obj-17",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 170.0, 138.0, 178.0, 20.0 ],
									"text" : "read from a queue (events)"
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"id" : "obj-16",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 170.0, 107.0, 213.0, 20.0 ],
									"text" : "create, manage, and write to queues"
								}

							}
, 							{
								"box" : 								{
									"align" : 0,
									"background" : 1,
									"id" : "obj-14",
									"maxclass" : "textbutton",
									"numinlets" : 1,
									"numoutlets" : 3,
									"outlettype" : [ "", "", "int" ],
									"parameter_enable" : 0,
									"patching_rect" : [ 18.0, 167.0, 144.0, 23.0 ],
									"saved_attribute_attributes" : 									{
										"textoncolor" : 										{
											"expression" : "themecolor.theme_selectioncolor"
										}

									}
,
									"text" : "pdmq.reader~",
									"textjustification" : 0,
									"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
								}

							}
, 							{
								"box" : 								{
									"align" : 0,
									"background" : 1,
									"id" : "obj-12",
									"maxclass" : "textbutton",
									"numinlets" : 1,
									"numoutlets" : 3,
									"outlettype" : [ "", "", "int" ],
									"parameter_enable" : 0,
									"patching_rect" : [ 18.0, 136.0, 144.0, 23.0 ],
									"saved_attribute_attributes" : 									{
										"textoncolor" : 										{
											"expression" : "themecolor.theme_selectioncolor"
										}

									}
,
									"text" : "pdmq.reader",
									"textjustification" : 0,
									"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"hidden" : 1,
									"id" : "obj-11",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 82.0, 342.0, 51.0, 22.0 ],
									"text" : "pcontrol"
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"hidden" : 1,
									"id" : "obj-10",
									"maxclass" : "newobj",
									"numinlets" : 1,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 82.0, 291.0, 110.0, 22.0 ],
									"text" : "sprintf %s.maxhelp"
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"hidden" : 1,
									"id" : "obj-9",
									"maxclass" : "message",
									"numinlets" : 2,
									"numoutlets" : 1,
									"outlettype" : [ "" ],
									"patching_rect" : [ 82.0, 318.0, 48.0, 22.0 ],
									"text" : "load $1"
								}

							}
, 							{
								"box" : 								{
									"align" : 0,
									"background" : 1,
									"id" : "obj-7",
									"maxclass" : "textbutton",
									"numinlets" : 1,
									"numoutlets" : 3,
									"outlettype" : [ "", "", "int" ],
									"parameter_enable" : 0,
									"patching_rect" : [ 17.0, 105.0, 144.0, 23.0 ],
									"saved_attribute_attributes" : 									{
										"textoncolor" : 										{
											"expression" : "themecolor.theme_selectioncolor"
										}

									}
,
									"text" : "pdmq",
									"textjustification" : 0,
									"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"id" : "obj-5",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 17.0, 70.0, 327.0, 20.0 ],
									"text" : " a package for queues in multichannel buffers"
								}

							}
, 							{
								"box" : 								{
									"background" : 1,
									"fontname" : "Lato",
									"fontsize" : 36.0,
									"id" : "obj-2",
									"maxclass" : "comment",
									"numinlets" : 1,
									"numoutlets" : 0,
									"patching_rect" : [ 17.0, 16.0, 327.0, 50.0 ],
									"text" : "pdmq"
								}

							}
 ],
						"lines" : [ 							{
								"patchline" : 								{
									"destination" : [ "obj-10", 0 ],
									"hidden" : 1,
									"source" : [ "obj-1", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-9", 0 ],
									"hidden" : 1,
									"source" : [ "obj-10", 0 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-10", 0 ],
									"hidden" : 1,
									"source" : [ "obj-12", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-10", 0 ],
									"hidden" : 1,
									"source" : [ "obj-14", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-10", 0 ],
									"hidden" : 1,
									"source" : [ "obj-4", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-10", 0 ],
									"hidden" : 1,
									"source" : [ "obj-7", 1 ]
								}

							}
, 							{
								"patchline" : 								{
									"destination" : [ "obj-11", 0 ],
									"hidden" : 1,
									"source" : [ "obj-9", 0 ]
								}

							}
 ]
					}
,
					"patching_rect" : [ 23.0, 15.0, 84.0, 22.0 ],
					"text" : "p components"
				}

			}
 ],
		"lines" : [  ],
		"dependency_cache" : [  ],
		"autosave" : 0
	}

}
