# pdmq
## Introduction
pdmq is a Max package for working working with queues of numbers in multichannel buffers. I developed this package to create an interface for live performance with sequencer-based instruments. Sequencers are commonly fed by lists of numbers: lists of 0s and 1s to form a step sequence, or lists of MIDI note or velocity values. Sequencers also have many parameters other parameters (for example, clock speed/BPM), and it is useful to be able to vary the values of those parameters over time. In a sense, it is "sequencing the sequencer." 

pdmq is designed to make it easy to build queues of numbers that reside in buffers, then consume the values in those buffers in the Max, MSP, and gen~ domains. The package has built-in tools for managing buffers, visualizing queues, and notifying other pdmq objects about changes to queues.

It supports the creation of an arbitrary number of queues using multichannel buffers. Buffers are often thought of as containers for audio in Max, but the are also useful as general containers for any set of numbers. 

## Requriements
Max 9.0.7 or higher

## Installation
Clone the repository to the `Max 9/Packages` folder and restart Max. 

## Components of pdmq
### pdmq core
The central component in pdmq is the `pdmq` abstraction. This patch is responsible for creating the queue buffers and exposes methods for modifying queue contents (write, clear, backspace) and setting playback parameters (loop length and update frequency). It also has robust querying capabilities that allows you to get queue data as a list or dictionary. Every patch that uses the pdmq system will include at least one `pdmq` instance.

### readers
In addition to the core object, there are three reader components that are able to consume the values from the queue and output them. They are: 
* `pdmq.reader` - Max reader for reading from queues in as floats
* `pdmq.reader~` - MSP reader for reading from queues as signals
* `pdmq.reader.gendsp` - gen~ reader for use inside gen~

### helpers
Finally, there are a set of objects that round out the pdmq family. These objects fall outside of the essential tasks of queue management, writing, and reading. They are:
* `pdmq.view` - v8ui-base viewer for queue data
* `pdmq.notify` - reports on changes to queues so that `pdmq.view` and other components can be refreshed
* `pdmq.frommtx` - allows Max's `matrixctrl` object to be used as a simple write interface for `pdmq`






