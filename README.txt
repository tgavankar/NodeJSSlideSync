Author:
Tanay Gavankar (tgavanka)

What is it:
SlideSync is a webapp that is meant to be a presentation tool. The problem it addresses is that when somebody is giving a presentation, they must have a projector to display their slides as well as other accessories such as a cable to connect their personal laptop (or a way to transfer the presentation file to another computer), a remote control for the slides, a clock, etc. Furthermore, moving a presentation to a different computer can often break layouts.

SlideSync solves this problem by allowing the presentor to create their presentation with the tool of their choice (HTML, Powerpoint, Keynote, etc), so that they do not have to learn a new software, and then simply upload the presentation. Then, the presentation is accessible from any device that has a modern web browser (desktop, laptop, tablet, phone). The presenter has a special "presenter" mode of their presentation that is optimized for a phone screen and has important information such as the current slide, forward/back buttons, the current time, and the current slide position. 

The key feature of SlideSync is that as the presentation is being shown, all other devices that are also viewing the presentation have their slides' positions automatically update as the presenter progresses. This enables all sorts of use cases, such as distance presentations with only a phone, using a mobile device as a remote control during a presentation, or even allowing conference room members to follow along in a presentation when a large screen is not present (i.e. companies can stock conference rooms with just tablets, which are much cheaper than enterprise level presentation systems). 

By allowing users to submit their presentations either in HTML/CSS (powered by dzSlides, a single-page presentation template framework) or PDF, both power users who enjoy the customizability of HTML as well as the general user who wants to stick with their usual software can use SlideSync. By having everything run in the browser, no installation is required and so it is completely cross-platform (not even a PDF reader is needed!).


How to use:
1. Open the app (or visit the homepage URL - http://popatvm.res.cmu.edu:8888 - email me if this is down as I'm hosting it on my personal desktop). 
2. Register or login (existing account with existing data user / pass: tanay / 123
3. (This should be done on desktop.) Go to "New" page to create a new HTML presentation or PDF presentation. (Note that if you use HTML, it MUST be with the framework of dzSlides - see http://paulrouget.com/dzslides/).
4. Go to "Presentations" page and look at available presentations. The "View" button will open the presentation in viewer mode (just the presentation and it follows the presentator's copy). The "Present" button will open the presentation in presentor view (forward/back buttons, time, slide position, control over viewers). Note that for both views, you can independently change slides also by a swipe left or swipe right gesture. 
5. The QR buttons will open a QR code that can be displayed to users with smartphones - they can use their own barcode scanner apps to open up the the link in their browser.