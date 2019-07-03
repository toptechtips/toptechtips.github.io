---
layout: page
title: Say Hello.
subtitle: Wan't to work on something?
show-avatar: false
js: /js/contact.js
ext-js: ['https://www.gstatic.com/firebasejs/6.2.4/firebase-app.js', 'https://www.gstatic.com/firebasejs/6.2.4/firebase-auth.js', 'https://www.gstatic.com/firebasejs/6.2.4/firebase-firestore.js']
---
Please do not hesitate to contact me :D <br>
Have a project you wan't to work on? Or just wan't to connect?


*[HTML]:
<form class="form-horizontal">
  <div class="grid">
    <div class="form-group">
      <div class="col-xs-6">
        <input type="text" class="form-control input-lg" id="name_input" placeholder="Name" required="required">
      </div>
      <div class="col-xs-6">
        <input type="email" class="form-control input-lg" id="email_input" placeholder="Email" required="required">
      </div>
    </div>
    <div class="form-group">
      <div class="col-xs-12">
        <textarea id="msg_input" type="text" name="message" class="form-control input-lg" placeholder="Message" title="Message" required="required" rows="3"></textarea>
      </div>
    </div>
  </div>

  <button id="submit_msg" type="button" class="btn btn-lg btn-primary">Submit</button>
</form>
