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
		"openrect" : [ 50.0, 50.0, 400.0, 300.0 ],
		"gridsize" : [ 15.0, 15.0 ],
		"integercoordinates" : 1,
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-6",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 176.0, 238.0, 178.0, 20.0 ],
					"text" : "use matrixctrl as a queue UI"
				}

			}
, 			{
				"box" : 				{
					"align" : 0,
					"id" : "obj-4",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 25.0, 236.0, 144.0, 23.0 ],
					"saved_attribute_attributes" : 					{
						"textoncolor" : 						{
							"expression" : "themecolor.theme_selectioncolor"
						}

					}
,
					"text" : "pdm.queue.frommtx",
					"textjustification" : 0,
					"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-3",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 176.0, 207.0, 178.0, 20.0 ],
					"text" : "visualize queues"
				}

			}
, 			{
				"box" : 				{
					"align" : 0,
					"id" : "obj-1",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 25.0, 205.0, 144.0, 23.0 ],
					"saved_attribute_attributes" : 					{
						"textoncolor" : 						{
							"expression" : "themecolor.theme_selectioncolor"
						}

					}
,
					"text" : "pdm.queue.view",
					"textjustification" : 0,
					"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-18",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 176.0, 176.0, 178.0, 20.0 ],
					"text" : "read from a queue (signals)"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-17",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 176.0, 145.0, 178.0, 20.0 ],
					"text" : "read from a queue (events)"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-16",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 176.0, 114.0, 213.0, 20.0 ],
					"text" : "create, manage, and write to queues"
				}

			}
, 			{
				"box" : 				{
					"align" : 0,
					"id" : "obj-14",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 24.0, 174.0, 144.0, 23.0 ],
					"saved_attribute_attributes" : 					{
						"textoncolor" : 						{
							"expression" : "themecolor.theme_selectioncolor"
						}

					}
,
					"text" : "pdm.queue.reader~",
					"textjustification" : 0,
					"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"align" : 0,
					"id" : "obj-12",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 24.0, 143.0, 144.0, 23.0 ],
					"saved_attribute_attributes" : 					{
						"textoncolor" : 						{
							"expression" : "themecolor.theme_selectioncolor"
						}

					}
,
					"text" : "pdm.queue.reader",
					"textjustification" : 0,
					"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"hidden" : 1,
					"id" : "obj-11",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 88.0, 349.0, 51.0, 22.0 ],
					"text" : "pcontrol"
				}

			}
, 			{
				"box" : 				{
					"hidden" : 1,
					"id" : "obj-10",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 88.0, 298.0, 110.0, 22.0 ],
					"text" : "sprintf %s.maxhelp"
				}

			}
, 			{
				"box" : 				{
					"hidden" : 1,
					"id" : "obj-9",
					"maxclass" : "message",
					"numinlets" : 2,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 88.0, 325.0, 48.0, 22.0 ],
					"text" : "load $1"
				}

			}
, 			{
				"box" : 				{
					"align" : 0,
					"id" : "obj-7",
					"maxclass" : "textbutton",
					"numinlets" : 1,
					"numoutlets" : 3,
					"outlettype" : [ "", "", "int" ],
					"parameter_enable" : 0,
					"patching_rect" : [ 23.0, 112.0, 144.0, 23.0 ],
					"saved_attribute_attributes" : 					{
						"textoncolor" : 						{
							"expression" : "themecolor.theme_selectioncolor"
						}

					}
,
					"text" : "pdm.queue",
					"textjustification" : 0,
					"textoncolor" : [ 0.922234290352602, 0.71007200526417, 0.329758341965716, 1.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-5",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 23.0, 69.0, 327.0, 20.0 ],
					"text" : "a package for working buffer-based queues"
				}

			}
, 			{
				"box" : 				{
					"fontname" : "Lato",
					"fontsize" : 36.0,
					"id" : "obj-2",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 23.0, 15.0, 327.0, 50.0 ],
					"text" : "pdm.queue "
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-10", 0 ],
					"hidden" : 1,
					"source" : [ "obj-1", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-9", 0 ],
					"hidden" : 1,
					"source" : [ "obj-10", 0 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-10", 0 ],
					"hidden" : 1,
					"source" : [ "obj-12", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-10", 0 ],
					"hidden" : 1,
					"source" : [ "obj-14", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-10", 0 ],
					"hidden" : 1,
					"source" : [ "obj-4", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-10", 0 ],
					"hidden" : 1,
					"source" : [ "obj-7", 1 ]
				}

			}
, 			{
				"patchline" : 				{
					"destination" : [ "obj-11", 0 ],
					"hidden" : 1,
					"source" : [ "obj-9", 0 ]
				}

			}
 ],
		"dependency_cache" : [  ],
		"autosave" : 0
	}

}
