{
	"patcher" : 	{
		"fileversion" : 1,
		"appversion" : 		{
			"major" : 9,
			"minor" : 0,
			"revision" : 6,
			"architecture" : "x64",
			"modernui" : 1
		}
,
		"classnamespace" : "box",
		"rect" : [ 677.0, 100.0, 801.0, 848.0 ],
		"gridsize" : [ 15.0, 15.0 ],
		"integercoordinates" : 1,
		"boxes" : [ 			{
				"box" : 				{
					"id" : "obj-6",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 2,
					"outlettype" : [ "", "" ],
					"patching_rect" : [ 99.0, 234.0, 243.0, 22.0 ],
					"text" : "patcherargs @qbuf qbuf @metabuf metabuf"
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-4",
					"linecount" : 35,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 233.0, 278.0, 532.0, 476.0 ],
					"text" : "# pdm.queue.manager\n\nA Max object for managing multiple queue buffers with synchronized read/write operations.\n\n## Description\n\n`pdm.queue.manager` is a Max object that manages multiple queue buffers, allowing synchronized operations across multiple channels. It provides functionality for writing data, controlling playback position, and configuring loop behavior.\n\n## Parameters\n\n- `qbuf` (required): Name of the data buffer to use\n- `metabuf` (required): Name of the read buffer to use\n\n## Messages\n\n### List Input\n- `list position value`: Write a value at the specified position to all channels\n  - `position`: The position to write to\n  - `value`: The value to write\n\n### Commands\n\n- `back [channel] [steps]`: Move the write position backward\n  - `channel`: Specific channel to affect. Use 0 for all channels (default: 0)\n  - `steps` (optional): Number of steps to move back (default: 1)\n\n- `looplen [channel] length`: Set the loop length\n  - `channel` (optional): Specific channel to affect Use 0 for all channels (default: 0)\n  - `length`: New loop length (must be positive)\n\n- `every [channel] every`: Set the every value\n  - `channel` : Specific channel to affect Use 0 for all channels (default: 0)\n  - `every`: New every value (must be positive)"
				}

			}
, 			{
				"box" : 				{
					"filename" : "pdm.queue.manager.js",
					"id" : "obj-2",
					"maxclass" : "newobj",
					"numinlets" : 1,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 40.0, 350.0, 135.0, 22.0 ],
					"saved_object_attributes" : 					{
						"parameter_enable" : 0
					}
,
					"text" : "v8 pdm.queue.manager",
					"textfile" : 					{
						"filename" : "pdm.queue.manager.js",
						"flags" : 0,
						"embed" : 0,
						"autowatch" : 1
					}

				}

			}
, 			{
				"box" : 				{
					"comment" : "",
					"id" : "obj-5",
					"index" : 1,
					"maxclass" : "outlet",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 44.0, 691.0, 30.0, 30.0 ]
				}

			}
, 			{
				"box" : 				{
					"comment" : "",
					"id" : "obj-34",
					"index" : 2,
					"maxclass" : "outlet",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 140.0, 691.0, 30.0, 30.0 ]
				}

			}
, 			{
				"box" : 				{
					"id" : "obj-23",
					"linecount" : 10,
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 40.0, 44.0, 502.0, 141.0 ],
					"text" : "writer for a circular buffer with a sliding window in a queue. \n\nunlike with arrays where push is availalbe, we need to manually track the last written slot in order to append correctly. the last value in the buffer is used to store the index of the last-written slot. therefore, it's useful to use an array length of pow(2, n) + 1 samples (e.g. 129 or 257), to make it clearer that the last slot is for this piece of metadata.\n\nthe \"last-written slot\" is perhaps more accurately described as a write counter, because it allows values that are greater than the buffer length. a modulo inside the reader manages the overflow."
				}

			}
, 			{
				"box" : 				{
					"fontsize" : 14.0,
					"id" : "obj-20",
					"maxclass" : "comment",
					"numinlets" : 1,
					"numoutlets" : 0,
					"patching_rect" : [ 40.0, 20.0, 174.0, 22.0 ],
					"text" : "pdm.queue.writer"
				}

			}
, 			{
				"box" : 				{
					"comment" : "list: channel, value to write",
					"id" : "obj-194",
					"index" : 1,
					"maxclass" : "inlet",
					"numinlets" : 0,
					"numoutlets" : 1,
					"outlettype" : [ "" ],
					"patching_rect" : [ 40.0, 194.0, 30.0, 30.0 ]
				}

			}
 ],
		"lines" : [ 			{
				"patchline" : 				{
					"destination" : [ "obj-2", 0 ],
					"source" : [ "obj-194", 0 ]
				}

			}
 ]
	}

}
