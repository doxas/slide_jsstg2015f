
module.exports = {
	parse: function(md){
		var i, j, k, l;
		var tag, content, source, dest, page;
		if(md == null || typeof md !== 'string'){return null;}
		source = md.replace(/\t/g, '');
		while(md.match(/\*\*[^\*]+\*\*/)){
			md = md.replace(/\*\*/, '<strong>');
			md = md.replace(/\*\*/, '</strong>');
		}
		source = md.match(/\*[^\*]+\*/g);
		source = md.split('\n');
		if(source.length === 0){return null;}
		dest = [];
		for(i = 0, j = source.length; i < j; i++){
			while(source[i].match(/`[^`]+`/)){
				source[i] = source[i].replace(/`/, '<code>');
				source[i] = source[i].replace(/`/, '</code>');
			}
			if(page){
				switch(true){
					// code block
					case (source[i].match(/^``` *$/) != null):
						page = false;
						dest[i - 1] = dest[i - 1].substr(0, dest[i - 1].length - 1);
						dest[i] = '</code></pre>\n';
						break;
					default :
						dest[i] = source[i].replace(/\t/g, '  ') + '\n';
						break;
				}
			}else{
				switch(true){
					// headers
					case (source[i].match(/^#{1,6} /) != null):
						k = source[i].match(/^#{1,6} /);
						tag = 'h' + (k[0].length - k[0].replace(/#/g, '').length);
						content = source[i].replace(/^#{1,6} /, '');
						dest[i] = '\t<' + tag + '>' + content + '</' + tag + '>\n';
						break;
					// separator
					case (source[i].match(/^--- *$/) != null):
						dest[i] = '</div>\n<div class="page">\n';
						break;
					// code block
					case (source[i].match(/^``` *$/) != null):
						page = true;
						dest[i] = '\t<pre><code>';
						break;
					// captions
					case (source[i].match(/^--.+-- *$/) != null):
						k = source[i].match(/--.+--/);
						content = k[0].replace(/--/g, '');
						tag = '\t<p><span class="capt">';
						dest[i] = tag + content + '</span></p>\n';
						break;
					// image
					case (source[i].match(/^!\[.*\]\(.+\) *$/) != null):
						k = source[i].match(/\[.*\]/);
						k = k[0].replace(/\[|\]/g, '');
						l = source[i].match(/\(.+\)/);
						l = l[0].replace(/\(|\)/g, '');
						tag = 'img src="image/' + l + '" alt="' + k + '"';
						dest[i] = '\t<p><' + tag + '></p>\n';
						break;
					// list
					case (source[i].match(/^\* /) != null):
						if((i > 0 && !source[i - 1].match(/^\* /)) || i === 0){
							k = source[i].match(/^\* /);
							tag = 'li';
							content = source[i].replace(/^\* +/, '');
							while(content.match(/\*[^\*]+\*/)){
								content = content.replace(/\*/, '<em>');
								content = content.replace(/\*/, '</em>');
							}
							dest[i] = '\t<ul>\n\t\t<' + tag + '>' + content + '</' + tag + '>\n';
							if(i === j - 1 || !source[i + 1].match(/^\* /)){dest[i] += '\n\t</ul>';}
						}else if(i === j - 1 || !source[i + 1].match(/^\* /)){
							k = source[i].match(/^\* /);
							tag = 'li';
							content = source[i].replace(/^\* +/, '');
							while(content.match(/\*[^\*]+\*/)){
								content = content.replace(/\*/, '<em>');
								content = content.replace(/\*/, '</em>');
							}
							dest[i] = '\t\t<' + tag + '>' + content + '</' + tag + '>\n\t</ul>\n';
						}else{
							k = source[i].match(/^\* /);
							tag = 'li';
							content = source[i].replace(/^\* +/, '');
							while(content.match(/\*[^\*]+\*/)){
								content = content.replace(/\*/, '<em>');
								content = content.replace(/\*/, '</em>');
							}
							dest[i] = '\t\t<' + tag + '>' + content + '</' + tag + '>\n';
						}
						break;
					case (source[i].match(/^.+/) != null):
						while(source[i].match(/\*[^\*]+\*/)){
							source[i] = source[i].replace(/\*/, '<em>');
							source[i] = source[i].replace(/\*/, '</em>');
						}
						dest[i] = '\t<p>' + source[i] + '</p>\n';
						break;
					case source[i] === '':
						dest[i] = '';
						break;
				}
			}
		}
		dest[dest.length] = '</div>\n';
		return '\n<div class="page">\n' + dest.join('') + '\n';
	}
};
