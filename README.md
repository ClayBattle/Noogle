# Noogle
An extension that creates a new Google Doc and places it within my internal drive folder structure within 1 minute. The goal is to have something that makes it very easy to maintain google drive organization, while also making it really easy to spawn a new Google Doc. Meant to be loaded as a dev extension. 

Spawned out of the need for 1. better Google Drive document organization and 2. frantic "oh no, I don't have a blank note document for recording meeting notes" 1 minute before the meeting starts. I want this to be the best of both worlds (organization and efficiency)


## Extension Setup (Edge)
1. Clone the repo to a new directory
2. Head to the Google Cloud Console
3. Select Noogle as the active project, then head to the APIs & services page (https://console.cloud.google.com/apis/credentials?project=noogle-448219)
4. Click Credentials
5. Download the EdgeExtension(WebAPP) credential
6. Rename the credential to credentials.json
7. Move the credentials to the Noogle directory
8. Click on the puzzle piece in Edge (extensions page)
10. Under installed extensions, click 'load unpacked'
11. Select this (Noogle) directory
12. Nice


## Attribution
Icon - https://www.rawpixel.com/image/6479591/png-sticker-book


## Todo-list where to resume:
1. Handle cached token expiration
2. Placing file in its own directory option... TODO when I figure out how I want to do folders in the future
* Specifically, need to explore what folders I want, and how I want to maintain them. especially important for  meeting notes and initiative exploration type notes like research on stocks. Additionally, the ability to create (NOT delete) folders would be really nice. Ideally if I'm making an initiative related note I'll link it in its confluence document. Or maybe I'll end up prefering the google docs and drive org approach best. I really don't know. We will have to seee

### other:
2. looking into how templates work