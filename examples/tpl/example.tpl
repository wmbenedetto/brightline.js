<!-- BEGIN header -->
        <a href="{{link}}" target="_blank">
            <img src="{{cover.source}}" title="Visit {{name}} Facebook page" />
        </a>
        <!-- END header -->

        <div id="content">

            <!-- BEGIN likes -->
            <div id="likes">
                <h3>{{numLikes}} Likes</h3>
                <!-- BEGIN like -->
                <div class="like"></div>
                <!-- END like -->
            </div>
            <!-- END likes -->

            <!-- BEGIN name -->
            <h1><a href="{{link}}" title="Visit {{name}} website">{{name}}</a></h1>
            <!-- END name -->

            <h4>{{about}}</h4>

            <!-- BEGIN paragraph -->
            <p>{{paragraph}}</p>
            <!-- END paragraph -->

            <h3>Articles</h3>
            <ul>
                <!-- BEGIN pressGroup -->
                <li>
                    <div><b>{{type}}</b></div>
                    <ul>
                        <!-- BEGIN pressItem -->
                        <li>
                            <a href="{{url}}">{{title}}</a>
                        </li>
                        <!-- END pressItem -->
                    </ul>
                </li>
                <!-- END pressGroup -->
            </ul>

            <h3>As Seen On</h3>
            <ul>
                <!-- BEGIN publication -->
                <li>{{pubName}}</li>
		<!-- END publication -->
	    </ul>

	</div>

	<!-- BEGIN pageID -->
    The id of this Facebook page is {{id}}
    <!-- END pageID -->